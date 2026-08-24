import { useEffect, useRef, useState } from "react";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { Branding } from "./components/Branding";
import { Player } from "./components/Player";
import { SettingsPanel } from "./components/SettingsPanel";
import { SettingsIcon } from "./components/icons";
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

  // Space toggles play/pause, unless focus is on a text field or the panel is open.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || settingsOpen) return;
      e.preventDefault();
      handleTogglePlay();
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

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
        className="fixed right-4 top-4 sm:right-5 sm:top-5 z-30 grid h-9 w-9 place-items-center rounded-full text-mist/55 hover:text-mist hover:bg-mist/10 transition-colors"
      >
        <SettingsIcon width={18} height={18} />
      </button>

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
