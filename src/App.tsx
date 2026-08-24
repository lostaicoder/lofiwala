import { useEffect, useRef, useState } from "react";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { Branding } from "./components/Branding";
import { Player } from "./components/Player";
import { SettingsPanel } from "./components/SettingsPanel";
import { EnterFullscreenIcon, ExitFullscreenIcon, SettingsIcon } from "./components/icons";
import { useFullscreen } from "./hooks/useFullscreen";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import { applyAccent } from "./lib/accent";
import { DEFAULT_PLAYLIST, DEFAULT_PLAYLIST_ID, STORAGE_KEYS } from "./lib/storage";
import type { AccentKey, BackgroundSettings, PlaylistEntry } from "./types";

export default function App() {
  const [playlists, setPlaylists] = useLocalStorage<PlaylistEntry[]>(STORAGE_KEYS.playlists, [
    DEFAULT_PLAYLIST,
  ]);
  const [activePlaylistId, setActivePlaylistId] = useLocalStorage<string>(
    STORAGE_KEYS.activePlaylistId,
    DEFAULT_PLAYLIST_ID,
  );
  const [background, setBackground] = useLocalStorage<BackgroundSettings>(STORAGE_KEYS.background, {
    mode: "default",
  });
  const [volume, setVolumeStored] = useLocalStorage<number>(STORAGE_KEYS.volume, 70);
  const [accent, setAccent] = useLocalStorage<AccentKey>(STORAGE_KEYS.accent, "ember");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const initialVolumeRef = useRef(volume);
  const fullscreen = useFullscreen();

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const player = useYouTubePlayer({
    playlistId: activePlaylistId,
    initialVolume: initialVolumeRef.current,
  });

  // Persist volume as the user adjusts it, without re-triggering the hook.
  useEffect(() => {
    setVolumeStored(player.volume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.volume]);

  // Space toggles play/pause, "f" toggles full screen — unless focus is on
  // a text field or the settings panel is open.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || settingsOpen) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "f" || e.key === "F") {
        if (fullscreen.isSupported) fullscreen.toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpen]);

  function handleTogglePlay() {
    setHasStarted(true);
    player.togglePlay();
  }

  function handleSelectPlaylist(id: string) {
    setActivePlaylistId(id);
    setHasStarted(false);
  }

  function handleAddPlaylist(entry: PlaylistEntry) {
    setPlaylists((prev) => (prev.some((p) => p.id === entry.id) ? prev : [...prev, entry]));
  }

  function handleRemovePlaylist(id: string) {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
    if (activePlaylistId === id) {
      setActivePlaylistId(DEFAULT_PLAYLIST_ID);
    }
  }

  return (
    <>
      <BackgroundLayer settings={background} />

      <Player
        status={player.status}
        now={player.now}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        muted={player.muted}
        shuffle={player.shuffle}
        loop={player.loop}
        errorMessage={player.errorMessage}
        hasStarted={hasStarted}
        onTogglePlay={handleTogglePlay}
        onNext={player.next}
        onPrevious={player.previous}
        onSeek={player.seekTo}
        onVolumeChange={player.setVolume}
        onToggleMute={player.toggleMute}
        onToggleShuffle={player.toggleShuffle}
        onCycleLoop={player.cycleLoop}
      />

      <div className="fixed right-3 top-3 z-30 flex items-center gap-1 sm:right-5 sm:top-5">
        {fullscreen.isSupported && (
          <button
            type="button"
            onClick={fullscreen.toggle}
            aria-label={fullscreen.isFullscreen ? "Exit full screen" : "Enter full screen"}
            className="grid h-9 w-9 place-items-center rounded-full text-mist/55 transition-colors hover:bg-mist/10 hover:text-mist"
          >
            {fullscreen.isFullscreen ? (
              <ExitFullscreenIcon width={17} height={17} />
            ) : (
              <EnterFullscreenIcon width={17} height={17} />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          className="grid h-9 w-9 place-items-center rounded-full text-mist/55 transition-colors hover:bg-mist/10 hover:text-mist"
        >
          <SettingsIcon width={18} height={18} />
        </button>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        playlists={playlists}
        activePlaylistId={activePlaylistId}
        onSelectPlaylist={handleSelectPlaylist}
        onAddPlaylist={handleAddPlaylist}
        onRemovePlaylist={handleRemovePlaylist}
        background={background}
        onBackgroundChange={setBackground}
        accent={accent}
        onAccentChange={setAccent}
      />

      <Branding />
    </>
  );
}
