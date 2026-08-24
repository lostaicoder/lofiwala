/**
 * Pulls a YouTube playlist ID out of anything a person might paste:
 * a full music.youtube.com / youtube.com URL, a shortened link, or
 * a bare playlist ID.
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare ID, e.g. "PLxxxxxxxx" or "RDCLAK5uy_..." with no URL parts.
  if (!trimmed.includes("/") && !trimmed.includes("?") && /^[a-zA-Z0-9_-]{8,}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const list = url.searchParams.get("list");
    if (list) return list;
  } catch {
    // fall through to regex below
  }

  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
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
