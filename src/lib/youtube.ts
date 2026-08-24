/**
 * Pulls a YouTube playlist ID out of anything a person might paste:
 * a full music.youtube.com / youtube.com URL, a shortened link, or
 * a bare playlist ID.
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let raw: string | null = null;

  // Bare ID, e.g. "PLxxxxxxxx" or "RDCLAK5uy_..." with no URL parts.
  if (!trimmed.includes("/") && !trimmed.includes("?") && /^[a-zA-Z0-9_-]{2,}$/.test(trimmed)) {
    raw = trimmed;
  } else {
    try {
      const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
      raw = url.searchParams.get("list");
    } catch {
      // not a parseable URL — fall through to the regex below
    }

    if (!raw) {
      const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      raw = match ? match[1] : null;
    }
  }

  return raw ? normalizePlaylistId(raw) : null;
}

/**
 * YouTube Music's web UI very often copies playlist links with a "VL"
 * prefix on the ID — e.g. `music.youtube.com/playlist?list=VLPLxxxxxxxx`.
 * That prefix is a music.youtube.com-only wrapper: the regular YouTube
 * IFrame Player API (which is what actually plays the audio here) only
 * recognizes the ID *after* stripping it. Without this, every playlist
 * copied straight from YouTube Music would silently fail to load.
 */
function normalizePlaylistId(id: string): string {
  if (id.length > 2 && id.startsWith("VL")) {
    return id.slice(2);
  }
  return id;
}

/**
 * "Liked Music" and "Watch Later" are personal, private lists — YouTube
 * never allows them to be embedded, regardless of the ID format, so it's
 * worth telling the person clearly instead of just failing quietly.
 */
export function isPrivatePlaylistId(id: string): boolean {
  return id === "WL" || id === "LM";
}

export function isLikelyYouTubeUrl(input: string): boolean {
  return /youtube\.com|youtu\.be|music\.youtube\.com/i.test(input);
}

export function thumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function playlistWatchUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}
