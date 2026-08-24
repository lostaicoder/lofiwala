import type { CSSProperties } from "react";
import type { LoopMode, NowPlaying, PlayerStatus } from "../types";
import { NowPlayingArt } from "./NowPlayingArt";
import { formatTime } from "../lib/format";
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./icons";
import { thumbnailUrl } from "../lib/youtube";

interface PlayerProps {
  status: PlayerStatus;
  now: NowPlaying | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  loop: LoopMode;
  errorMessage: string | null;
  hasStarted: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onCycleLoop: () => void;
}

export function Player({
  status,
  now,
  currentTime,
  duration,
  volume,
  muted,
  shuffle,
  loop,
  errorMessage,
  hasStarted,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleLoop,
}: PlayerProps) {
  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const artworkUrl = now?.videoId ? thumbnailUrl(now.videoId) : null;
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volumePct = muted ? 0 : volume;

  return (
    <div className="fixed inset-x-3 bottom-7 z-20 mx-auto max-w-xl sm:inset-x-6">
      <div className="relative overflow-hidden rounded-2xl border border-mist/10 bg-glass/80 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <input
          type="range"
          className="scrub-thin"
          style={{ "--fill": `${progressPct}%` } as CSSProperties}
          min={0}
          max={duration || 0}
          step={0.5}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Seek"
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3.5 py-2.5 sm:px-4 sm:py-3">
          <NowPlayingArt artworkUrl={artworkUrl} isPlaying={isPlaying} isLoading={isLoading} />

          <div className="min-w-[96px] flex-1 basis-32">
            <p className="truncate font-display text-[13.5px] font-medium leading-tight text-mist sm:text-sm">
              {now?.title || (isLoading ? "Tuning in…" : "Ready when you are")}
            </p>
            <p className="truncate text-[11px] leading-tight text-mist/50">{now?.author || "\u00A0"}</p>
          </div>

          <span className="hidden shrink-0 font-mono text-[10px] tabular-nums text-mist/40 md:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={onToggleShuffle}
              aria-pressed={shuffle}
              aria-label="Shuffle"
              className={`rounded-full p-1.5 transition-colors ${
                shuffle ? "text-accent" : "text-mist/45 hover:text-mist/75"
              }`}
            >
              <ShuffleIcon width={14} height={14} />
            </button>

            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous track"
              className="rounded-full p-1.5 text-mist/75 transition-colors hover:text-mist"
            >
              <PrevIcon width={16} height={16} />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-ink transition-transform hover:scale-105 active:scale-95 ${
                !hasStarted ? "animate-pulse" : ""
              }`}
            >
              {isLoading ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-ink/40 border-t-ink" />
              ) : isPlaying ? (
                <PauseIcon width={16} height={16} />
              ) : (
                <PlayIcon width={16} height={16} className="ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="rounded-full p-1.5 text-mist/75 transition-colors hover:text-mist"
            >
              <NextIcon width={16} height={16} />
            </button>

            <button
              type="button"
              onClick={onCycleLoop}
              aria-label={`Repeat: ${loop}`}
              aria-pressed={loop !== "off"}
              className={`rounded-full p-1.5 transition-colors ${
                loop !== "off" ? "text-accent" : "text-mist/45 hover:text-mist/75"
              }`}
            >
              <RepeatIcon width={14} height={14} variant={loop === "one" ? "one" : "all"} />
            </button>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-mist/50 transition-colors hover:text-mist"
            >
              {muted || volume === 0 ? <VolumeMuteIcon width={14} height={14} /> : <VolumeIcon width={14} height={14} />}
            </button>
            <input
              type="range"
              className="scrub w-16"
              style={{ "--fill": `${volumePct}%` } as CSSProperties}
              min={0}
              max={100}
              step={1}
              value={volumePct}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-2 text-center text-[11px] text-rosewood" role="status">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
