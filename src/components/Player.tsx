import type { CSSProperties } from "react";
import type { LoopMode, NowPlaying, PlayerStatus } from "../types";
import { Vinyl } from "./Vinyl";
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
  playlistLabel: string;
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
  playlistLabel,
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
    <main className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center px-5 py-16">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-6 animate-fadeUp">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/45">
          now playing from <span className="text-mist/70">{playlistLabel}</span>
        </p>

        <Vinyl artworkUrl={artworkUrl} isPlaying={isPlaying} isLoading={isLoading} />

        <div className="flex w-full flex-col items-center gap-1.5 text-center">
          <h1 className="line-clamp-2 font-display text-xl sm:text-2xl font-medium leading-snug text-mist">
            {now?.title || (isLoading ? "Tuning in…" : "Ready when you are")}
          </h1>
          <p className="text-sm text-mist/55">{now?.author || "\u00A0"}</p>
        </div>

        {errorMessage && (
          <p className="rounded-full bg-rosewood/15 px-3 py-1 text-xs text-rosewood" role="status">
            {errorMessage}
          </p>
        )}

        {/* progress */}
        <div className="flex w-full items-center gap-2.5">
          <span className="font-mono text-[11px] tabular-nums text-mist/50 w-9 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            className="scrub"
            style={{ "--fill": `${progressPct}%` } as CSSProperties}
            min={0}
            max={duration || 0}
            step={0.5}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="font-mono text-[11px] tabular-nums text-mist/50 w-9">
            {formatTime(duration)}
          </span>
        </div>

        {/* transport controls */}
        <div className="flex items-center gap-4 sm:gap-5">
          <button
            type="button"
            onClick={onToggleShuffle}
            aria-pressed={shuffle}
            aria-label="Shuffle"
            className={`rounded-full p-2 transition-colors ${
              shuffle ? "text-accent" : "text-mist/50 hover:text-mist/80"
            }`}
          >
            <ShuffleIcon width={17} height={17} />
          </button>

          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous track"
            className="rounded-full p-2 text-mist/80 hover:text-mist transition-colors"
          >
            <PrevIcon width={22} height={22} />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={`grid h-14 w-14 place-items-center rounded-full bg-accent text-ink shadow-[0_8px_30px_-8px_rgb(var(--accent)/0.7)] transition-transform hover:scale-105 active:scale-95 ${
              !hasStarted ? "animate-pulse" : ""
            }`}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/40 border-t-ink" />
            ) : isPlaying ? (
              <PauseIcon width={24} height={24} />
            ) : (
              <PlayIcon width={24} height={24} className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            aria-label="Next track"
            className="rounded-full p-2 text-mist/80 hover:text-mist transition-colors"
          >
            <NextIcon width={22} height={22} />
          </button>

          <button
            type="button"
            onClick={onCycleLoop}
            aria-label={`Repeat: ${loop}`}
            aria-pressed={loop !== "off"}
            className={`rounded-full p-2 transition-colors ${
              loop !== "off" ? "text-accent" : "text-mist/50 hover:text-mist/80"
            }`}
          >
            <RepeatIcon width={17} height={17} variant={loop === "one" ? "one" : "all"} />
          </button>
        </div>

        {/* volume */}
        <div className="flex w-full max-w-[220px] items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="shrink-0 text-mist/60 hover:text-mist transition-colors"
          >
            {muted || volume === 0 ? <VolumeMuteIcon width={16} height={16} /> : <VolumeIcon width={16} height={16} />}
          </button>
          <input
            type="range"
            className="scrub"
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
    </main>
  );
}
