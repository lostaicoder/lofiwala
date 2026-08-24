interface VinylProps {
  artworkUrl: string | null;
  isPlaying: boolean;
  isLoading: boolean;
}

export function Vinyl({ artworkUrl, isPlaying, isLoading }: VinylProps) {
  return (
    <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] shrink-0 select-none">
      {/* soft desk glow beneath the record */}
      <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl scale-90 -z-10" aria-hidden="true" />

      {/* the record itself */}
      <div
        className={`absolute inset-0 rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ${
          isPlaying ? "animate-spin_slow" : ""
        } motion-reduce:animate-none`}
        style={{
          background:
            "repeating-radial-gradient(circle at center, #241938 0px, #241938 2px, #150E24 2px, #150E24 4px)",
        }}
        aria-hidden="true"
      >
        {/* sheen */}
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{
            background:
              "conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(243,233,221,0.18) 40deg, transparent 90deg, transparent 260deg, rgba(243,233,221,0.1) 300deg, transparent 340deg)",
          }}
        />
        {/* label / artwork */}
        <div className="absolute inset-[30%] rounded-full overflow-hidden border-2 border-ink/80 bg-plum">
          {artworkUrl ? (
            <img
              src={artworkUrl}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-plum to-ink" />
          )}
        </div>
        {/* spindle */}
        <div className="absolute inset-[47%] rounded-full bg-ink border border-mist/20" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="h-2.5 w-2.5 rounded-full bg-mist/70 animate-pulse" />
        </div>
      )}

      {/* tonearm, pivoting from the top-right corner */}
      <div className="absolute -top-3 -right-4 w-16 h-16" aria-hidden="true">
        <div className="absolute right-[10px] top-[10px] h-3.5 w-3.5 rounded-full bg-mist/60 border border-ink shadow-sm z-10" />
        <div
          className={`absolute right-[16px] top-[16px] h-[3px] w-[150px] sm:w-[190px] rounded-full origin-right bg-gradient-to-l from-mist/70 via-mist/40 to-transparent transition-transform duration-700 ease-out ${
            isPlaying ? "rotate-[32deg]" : "rotate-[2deg]"
          }`}
        >
          <span
            className={`absolute -left-1 -top-[5px] h-3 w-3 rounded-full bg-accent transition-shadow duration-700 ${
              isPlaying ? "shadow-[0_0_12px_3px_rgb(var(--accent)/0.65)]" : "shadow-none"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
