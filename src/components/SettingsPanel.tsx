import { useRef, useState } from "react";
import type { AccentKey, BackgroundMode, BackgroundSettings, PlaylistEntry } from "../types";
import { extractPlaylistId, isLikelyYouTubeUrl } from "../lib/youtube";
import { BG_IMAGE_KEY, BG_VIDEO_KEY, idbDeleteBlob, idbSetBlob } from "../lib/idb";
import { MAX_UPLOAD_BYTES } from "../lib/storage";
import { ACCENTS } from "../lib/accent";
import {
  CheckIcon,
  CloseIcon,
  ImageIcon,
  LinkIcon,
  SparkleIcon,
  TrashIcon,
  UploadIcon,
  VideoIcon,
} from "./icons";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  playlists: PlaylistEntry[];
  activePlaylistId: string;
  onSelectPlaylist: (id: string) => void;
  onAddPlaylist: (entry: PlaylistEntry) => void;
  onRemovePlaylist: (id: string) => void;
  background: BackgroundSettings;
  onBackgroundChange: (next: BackgroundSettings) => void;
  accent: AccentKey;
  onAccentChange: (key: AccentKey) => void;
}

function bytesToLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(0)}MB` : `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function SettingsPanel({
  open,
  onClose,
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onAddPlaylist,
  onRemovePlaylist,
  background,
  onBackgroundChange,
  accent,
  onAccentChange,
}: SettingsPanelProps) {
  const [playlistInput, setPlaylistInput] = useState("");
  const [playlistNameInput, setPlaylistNameInput] = useState("");
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  const [imageUrlInput, setImageUrlInput] = useState(background.imageUrl ?? "");
  const [videoUrlInput, setVideoUrlInput] = useState(background.videoUrl ?? "");
  const [imageError, setImageError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);

  const imageFileRef = useRef<HTMLInputElement | null>(null);
  const videoFileRef = useRef<HTMLInputElement | null>(null);

  function handleAddPlaylist(e: React.FormEvent) {
    e.preventDefault();
    setPlaylistError(null);
    const id = extractPlaylistId(playlistInput);
    if (!id) {
      setPlaylistError(
        isLikelyYouTubeUrl(playlistInput)
          ? "That link doesn't include a playlist. Open the playlist itself, then copy its URL."
          : "Paste a YouTube or YouTube Music playlist link (or its ID).",
      );
      return;
    }
    const existing = playlists.find((p) => p.id === id);
    if (existing) {
      onSelectPlaylist(id);
    } else {
      const entry: PlaylistEntry = {
        id,
        url: playlistInput.trim(),
        label: playlistNameInput.trim() || `Custom mix ${playlists.length}`,
        addedAt: Date.now(),
      };
      onAddPlaylist(entry);
      onSelectPlaylist(id);
    }
    setPlaylistInput("");
    setPlaylistNameInput("");
  }

  function setMode(mode: BackgroundMode) {
    onBackgroundChange({ ...background, mode });
  }

  async function resetBackground() {
    try {
      await idbDeleteBlob(BG_IMAGE_KEY);
      await idbDeleteBlob(BG_VIDEO_KEY);
    } catch {
      // ignore — worst case, a stale blob lingers in IndexedDB
    }
    setImageUrlInput("");
    setVideoUrlInput("");
    setImageError(null);
    setVideoError(null);
    onBackgroundChange({ mode: "default" });
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError("That file doesn't look like an image.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES.image) {
      setImageError(`Keep images under ${bytesToLabel(MAX_UPLOAD_BYTES.image)}.`);
      return;
    }
    setImageBusy(true);
    try {
      await idbSetBlob(BG_IMAGE_KEY, file);
      onBackgroundChange({ mode: "image", imageSource: "upload", uploadVersion: Date.now() });
    } catch {
      setImageError("Couldn't store that image on this device.");
    } finally {
      setImageBusy(false);
    }
  }

  async function handleVideoFile(file: File | undefined) {
    if (!file) return;
    setVideoError(null);
    if (!file.type.startsWith("video/")) {
      setVideoError("That file doesn't look like a video.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES.video) {
      setVideoError(`Keep videos under ${bytesToLabel(MAX_UPLOAD_BYTES.video)} — big files can slow the page down.`);
      return;
    }
    setVideoBusy(true);
    try {
      await idbSetBlob(BG_VIDEO_KEY, file);
      onBackgroundChange({ mode: "video", videoSource: "upload", uploadVersion: Date.now() });
    } catch {
      setVideoError("Couldn't store that video on this device.");
    } finally {
      setVideoBusy(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-[380px] flex-col border-l border-mist/10 bg-glass/95 backdrop-blur-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Settings"
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-mist/10 px-5 py-4">
          <h2 className="font-display text-lg text-mist">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-full p-1.5 text-mist/60 hover:bg-mist/10 hover:text-mist transition-colors"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-5">
          {/* PLAYLISTS */}
          <section className="mb-8">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/45">Playlist</h3>

            <form onSubmit={handleAddPlaylist} className="flex flex-col gap-2">
              <input
                type="text"
                inputMode="url"
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                placeholder="Paste a YouTube / YT Music playlist link"
                className="w-full rounded-lg border border-mist/15 bg-ink/40 px-3 py-2 text-sm text-mist placeholder:text-mist/35 outline-none focus:border-accent/60"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playlistNameInput}
                  onChange={(e) => setPlaylistNameInput(e.target.value)}
                  placeholder="Name it (optional)"
                  className="min-w-0 flex-1 rounded-lg border border-mist/15 bg-ink/40 px-3 py-2 text-sm text-mist placeholder:text-mist/35 outline-none focus:border-accent/60"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Load
                </button>
              </div>
              {playlistError && <p className="text-xs text-rosewood">{playlistError}</p>}
            </form>

            <ul className="mt-4 flex flex-col gap-1.5">
              {playlists.map((p) => {
                const isActive = p.id === activePlaylistId;
                return (
                  <li key={p.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectPlaylist(p.id)}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        isActive
                          ? "border-accent/50 bg-accent/10 text-mist"
                          : "border-transparent bg-mist/5 text-mist/70 hover:bg-mist/10"
                      }`}
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                          isActive ? "border-accent bg-accent text-ink" : "border-mist/30"
                        }`}
                      >
                        {isActive && <CheckIcon width={10} height={10} strokeWidth={3} />}
                      </span>
                      <span className="truncate">{p.label}</span>
                    </button>
                    {!p.isDefault && (
                      <button
                        type="button"
                        onClick={() => onRemovePlaylist(p.id)}
                        aria-label={`Remove ${p.label}`}
                        className="shrink-0 rounded-lg p-2 text-mist/40 hover:text-rosewood transition-colors"
                      >
                        <TrashIcon width={15} height={15} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* BACKGROUND */}
          <section className="mb-8">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/45">Background</h3>

            <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-lg bg-ink/40 p-1">
              {(
                [
                  { mode: "default" as const, label: "Ambient", icon: <SparkleIcon width={14} height={14} /> },
                  { mode: "image" as const, label: "Image", icon: <ImageIcon width={14} height={14} /> },
                  { mode: "video" as const, label: "Video", icon: <VideoIcon width={14} height={14} /> },
                ]
              ).map((opt) => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setMode(opt.mode)}
                  className={`flex flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] transition-colors ${
                    background.mode === opt.mode ? "bg-accent text-ink" : "text-mist/60 hover:text-mist"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>

            {background.mode === "image" && (
              <div className="flex flex-col gap-2 rounded-lg border border-mist/10 p-3">
                <button
                  type="button"
                  onClick={() => imageFileRef.current?.click()}
                  disabled={imageBusy}
                  className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-mist/25 py-3 text-sm text-mist/70 hover:border-accent/50 hover:text-mist transition-colors disabled:opacity-50"
                >
                  <UploadIcon width={15} height={15} />
                  {imageBusy ? "Saving…" : "Upload an image"}
                </button>
                <input
                  ref={imageFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                />
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-mist/10" />
                  <span className="text-[10px] uppercase tracking-widest text-mist/35">or</span>
                  <div className="h-px flex-1 bg-mist/10" />
                </div>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <LinkIcon width={13} height={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mist/35" />
                    <input
                      type="text"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste an image URL"
                      className="w-full rounded-lg border border-mist/15 bg-ink/40 py-2 pl-7 pr-2 text-sm text-mist placeholder:text-mist/35 outline-none focus:border-accent/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      imageUrlInput.trim() &&
                      onBackgroundChange({ mode: "image", imageSource: "url", imageUrl: imageUrlInput.trim() })
                    }
                    className="shrink-0 rounded-lg bg-mist/10 px-3 py-2 text-sm text-mist hover:bg-mist/20 transition-colors"
                  >
                    Set
                  </button>
                </div>
                {imageError && <p className="text-xs text-rosewood">{imageError}</p>}
              </div>
            )}

            {background.mode === "video" && (
              <div className="flex flex-col gap-2 rounded-lg border border-mist/10 p-3">
                <button
                  type="button"
                  onClick={() => videoFileRef.current?.click()}
                  disabled={videoBusy}
                  className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-mist/25 py-3 text-sm text-mist/70 hover:border-accent/50 hover:text-mist transition-colors disabled:opacity-50"
                >
                  <UploadIcon width={15} height={15} />
                  {videoBusy ? "Saving…" : "Upload a video loop"}
                </button>
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoFile(e.target.files?.[0])}
                />
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-mist/10" />
                  <span className="text-[10px] uppercase tracking-widest text-mist/35">or</span>
                  <div className="h-px flex-1 bg-mist/10" />
                </div>
                <div className="flex gap-2">
                  <div className="relative min-w-0 flex-1">
                    <LinkIcon width={13} height={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mist/35" />
                    <input
                      type="text"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Paste a direct .mp4 URL"
                      className="w-full rounded-lg border border-mist/15 bg-ink/40 py-2 pl-7 pr-2 text-sm text-mist placeholder:text-mist/35 outline-none focus:border-accent/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      videoUrlInput.trim() &&
                      onBackgroundChange({ mode: "video", videoSource: "url", videoUrl: videoUrlInput.trim() })
                    }
                    className="shrink-0 rounded-lg bg-mist/10 px-3 py-2 text-sm text-mist hover:bg-mist/20 transition-colors"
                  >
                    Set
                  </button>
                </div>
                {videoError && <p className="text-xs text-rosewood">{videoError}</p>}
              </div>
            )}

            <button
              type="button"
              onClick={resetBackground}
              className="mt-2.5 text-xs text-mist/40 hover:text-mist/70 transition-colors underline underline-offset-2 decoration-mist/20"
            >
              Reset to the default ambient background
            </button>
          </section>

          {/* ACCENT */}
          <section className="mb-4">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/45">Accent</h3>
            <div className="flex gap-2.5">
              {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onAccentChange(key)}
                  aria-label={ACCENTS[key].label}
                  aria-pressed={accent === key}
                  className={`grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-110 ${
                    accent === key ? "ring-2 ring-mist ring-offset-2 ring-offset-glass" : ""
                  }`}
                  style={{ backgroundColor: ACCENTS[key].hex }}
                >
                  {accent === key && <CheckIcon width={13} height={13} className="text-ink" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </section>
        </div>

        <p className="border-t border-mist/10 px-5 py-3 text-[11px] leading-relaxed text-mist/40">
          Everything here — playlists, backgrounds, volume — stays on this device only. Nothing is uploaded
          anywhere.
        </p>
      </aside>
    </>
  );
}
