export type BackgroundMode = "default" | "image" | "video";
export type MediaSource = "url" | "upload";

export interface BackgroundSettings {
  mode: BackgroundMode;
  imageSource?: MediaSource;
  imageUrl?: string; // used when imageSource === "url"
  videoSource?: MediaSource;
  videoUrl?: string; // used when videoSource === "url"
  /** bumped whenever an uploaded blob changes, so consumers know to re-read IndexedDB */
  uploadVersion?: number;
}

export interface PlaylistEntry {
  id: string;
  url: string;
  label: string;
  addedAt: number;
  isDefault?: boolean;
}

export type LoopMode = "off" | "all" | "one";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export interface NowPlaying {
  videoId: string;
  title: string;
  author: string;
  index: number;
  playlistLength: number;
}

export type AccentKey = "ember" | "rosewood" | "sage" | "lavender";
