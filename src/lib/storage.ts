import type { PlaylistEntry } from "../types";

export const DEFAULT_PLAYLIST_ID = "RDCLAK5uy_n41V9iqmjro6caBDuDD1E4eWs5yTb5_OY";

export const DEFAULT_PLAYLIST: PlaylistEntry = {
  id: DEFAULT_PLAYLIST_ID,
  url: `https://music.youtube.com/playlist?list=${DEFAULT_PLAYLIST_ID}`,
  label: "lofiwala mix",
  addedAt: 0,
  isDefault: true,
};

export const STORAGE_KEYS = {
  playlists: "lofiwala:playlists:v1",
  activePlaylistId: "lofiwala:activePlaylistId:v1",
  background: "lofiwala:background:v1",
  volume: "lofiwala:volume:v1",
  accent: "lofiwala:accent:v1",
} as const;

export const MAX_UPLOAD_BYTES = {
  image: 15 * 1024 * 1024, // 15MB
  video: 300 * 1024 * 1024, // 300MB — generous, but warn beyond this
};
