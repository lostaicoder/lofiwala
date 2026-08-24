interface NowPlayingArtProps {
  artworkUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
}

const BAR_DELAYS = [0, 0.15, 0.3];

export function NowPlayingArt({ artworkUrl, isPlaying, isLoading }: NowPlayingArtProps) {
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-mist/10 bg-plum sm:h-14 sm:w-14">
      {artworkUrl ? (
        <img src={artworkUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-plum to-ink" />
      )}

      {isLoading && (
        <div className="absolute inset-0 grid place-items-center bg-ink/40">
          <span className="h-1.5 w-1.5 rounded-full bg-mist/80 animate-pulse" />
        </div>
      )}

      {isPlaying && !isLoading && (
        <span
          className="absolute bottom-1 right-1 flex h-3.5 items-end gap-[2px] rounded-sm bg-ink/60 px-1 py-0.5"
          aria-hidden="true"
        >
          {BAR_DELAYS.map((delay, i) => (
            <span
              key={i}
              className="h-1.5 w-[2px] rounded-full bg-accent motion-reduce:!animate-none"
              style={{ animation: `eq 0.9s ease-in-out ${delay}s infinite` }}
            />
          ))}
        </span>
      )}
    </div>
  );
}
