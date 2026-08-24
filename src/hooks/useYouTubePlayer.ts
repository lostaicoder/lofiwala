import { useCallback, useEffect, useRef, useState } from "react";
import type { LoopMode, NowPlaying, PlayerStatus } from "../types";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  });

  return apiLoadPromise;
}

interface UseYouTubePlayerOptions {
  playlistId: string;
  initialVolume: number;
}

export function useYouTubePlayer({ playlistId, initialVolume }: UseYouTubePlayerOptions) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const pollRef = useRef<number | null>(null);
  const shuffleRef = useRef(false);
  const loopRef = useRef<LoopMode>("off");
  const mountedPlaylistRef = useRef<string | null>(null);

  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState<LoopMode>("off");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Host element the IFrame API attaches to. Kept off-screen and tiny —
  // this is an audio player, not a video player.
  useEffect(() => {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.position = "fixed";
    el.style.bottom = "0";
    el.style.left = "0";
    el.style.width = "2px";
    el.style.height = "2px";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    el.style.overflow = "hidden";
    document.body.appendChild(el);
    hostRef.current = el;
    return () => {
      el.remove();
    };
  }, []);

  const clearPoll = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPoll = useCallback(() => {
    clearPoll();
    pollRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      try {
        setCurrentTime(p.getCurrentTime() || 0);
        const d = p.getDuration();
        if (d) setDuration(d);
      } catch {
        // player mid-teardown — ignore this tick
      }
    }, 500);
  }, [clearPoll]);

  const refreshNowPlaying = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const data = p.getVideoData?.();
      const idx = p.getPlaylistIndex?.();
      const list = p.getPlaylist?.();
      if (data) {
        setNow({
          videoId: data.video_id ?? "",
          title: data.title || "",
          author: data.author || "",
          index: typeof idx === "number" ? idx : 0,
          playlistLength: Array.isArray(list) ? list.length : 0,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const attachEvents = useCallback(
    (player: any) => {
      player.addEventListener("onStateChange", (e: any) => {
        const YTns = window.YT;
        switch (e.data) {
          case YTns.PlayerState.PLAYING:
            setStatus("playing");
            setErrorMessage(null);
            refreshNowPlaying();
            startPoll();
            break;
          case YTns.PlayerState.PAUSED:
            setStatus("paused");
            clearPoll();
            break;
          case YTns.PlayerState.BUFFERING:
            setStatus("loading");
            break;
          case YTns.PlayerState.CUED:
            refreshNowPlaying();
            break;
          case YTns.PlayerState.ENDED:
            if (loopRef.current === "one") {
              player.seekTo(0, true);
              player.playVideo();
            } else {
              clearPoll();
              setStatus("ended");
            }
            break;
        }
      });

      player.addEventListener("onError", () => {
        // 2: bad param, 5: html5 error, 100: not found, 101/150: embedding disabled
        setErrorMessage("That track can't be played here — skipping ahead.");
        try {
          player.nextVideo();
        } catch {
          // ignore
        }
      });
    },
    [clearPoll, refreshNowPlaying, startPoll],
  );

  // (Re)initialize or re-target the player whenever the playlist changes.
  useEffect(() => {
    let cancelled = false;
    setErrorMessage(null);

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !hostRef.current) return;

      if (playerRef.current && mountedPlaylistRef.current) {
        try {
          setStatus("loading");
          playerRef.current.loadPlaylist({ list: playlistId, listType: "playlist", index: 0 });
          playerRef.current.setShuffle(shuffleRef.current);
          mountedPlaylistRef.current = playlistId;
          return;
        } catch {
          // fall through and rebuild the player below
        }
      }

      setStatus("loading");
      playerRef.current = new window.YT.Player(hostRef.current, {
        height: "2",
        width: "2",
        playerVars: {
          listType: "playlist",
          list: playlistId,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            mountedPlaylistRef.current = playlistId;
            e.target.setVolume(volume);
            attachEvents(e.target);
            setStatus("paused");
            refreshNowPlaying();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  // Full teardown on unmount only.
  useEffect(() => {
    return () => {
      clearPoll();
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {
      // ignore
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (status === "playing") pause();
    else play();
  }, [status, play, pause]);

  const next = useCallback(() => {
    try {
      playerRef.current?.nextVideo();
    } catch {
      // ignore
    }
  }, []);

  const previous = useCallback(() => {
    try {
      playerRef.current?.previousVideo();
    } catch {
      // ignore
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    try {
      playerRef.current?.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch {
      // ignore
    }
  }, []);

  const setVolume = useCallback(
    (v: number) => {
      setVolumeState(v);
      try {
        playerRef.current?.setVolume(v);
        if (v > 0 && muted) {
          playerRef.current?.unMute();
          setMuted(false);
        }
      } catch {
        // ignore
      }
    },
    [muted],
  );

  const toggleMute = useCallback(() => {
    try {
      if (muted) {
        playerRef.current?.unMute();
        setMuted(false);
      } else {
        playerRef.current?.mute();
        setMuted(true);
      }
    } catch {
      // ignore
    }
  }, [muted]);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const nextVal = !s;
      shuffleRef.current = nextVal;
      try {
        playerRef.current?.setShuffle(nextVal);
      } catch {
        // ignore
      }
      return nextVal;
    });
  }, []);

  const cycleLoop = useCallback(() => {
    setLoop((l) => {
      const order: LoopMode[] = ["off", "all", "one"];
      const nextMode = order[(order.indexOf(l) + 1) % order.length];
      loopRef.current = nextMode;
      try {
        playerRef.current?.setLoop(nextMode === "all");
      } catch {
        // ignore
      }
      return nextMode;
    });
  }, []);

  return {
    status,
    now,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    loop,
    errorMessage,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleLoop,
  };
}
