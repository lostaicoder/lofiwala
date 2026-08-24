import { useEffect, useState } from "react";
import type { BackgroundSettings } from "../types";
import { BG_IMAGE_KEY, BG_VIDEO_KEY, idbGetBlob } from "../lib/idb";

interface BackgroundLayerProps {
  settings: BackgroundSettings;
}

const MOTES = Array.from({ length: 14 }, (_, i) => i);

function DefaultBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-plum/70 to-ink" />
      <div className="absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full bg-plum/60 blur-3xl animate-drift motion-reduce:animate-none" />
      <div className="absolute -bottom-1/3 -right-1/4 h-[65vmax] w-[65vmax] rounded-full bg-rosewood/25 blur-3xl animate-drift2 motion-reduce:animate-none" />
      <div className="absolute top-1/3 right-1/4 h-[40vmax] w-[40vmax] rounded-full bg-ember/10 blur-3xl animate-drift motion-reduce:animate-none" />

      {MOTES.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i * 1.7) % 12;
        const duration = 14 + (i % 5) * 3;
        const size = 2 + (i % 3);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-mist/40 motion-reduce:hidden"
            style={{
              left: `${left}%`,
              bottom: "-5%",
              width: size,
              height: size,
              animation: `float-up ${duration}s linear ${delay}s infinite`,
            }}
          />
        );
      })}

      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay animate-grain motion-reduce:animate-none noise-bg" />
    </div>
  );
}

export function BackgroundLayer({ settings }: BackgroundLayerProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Resolve the image source (either a pasted URL, or an uploaded blob from IndexedDB).
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function resolve() {
      if (settings.mode !== "image") {
        setImageSrc(null);
        return;
      }
      if (settings.imageSource === "url" && settings.imageUrl) {
        setImageSrc(settings.imageUrl);
        return;
      }
      if (settings.imageSource === "upload") {
        try {
          const blob = await idbGetBlob(BG_IMAGE_KEY);
          if (blob && !cancelled) {
            objectUrl = URL.createObjectURL(blob);
            setImageSrc(objectUrl);
          }
        } catch {
          setImageSrc(null);
        }
      }
    }
    resolve();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [settings.mode, settings.imageSource, settings.imageUrl, settings.uploadVersion]);

  // Same idea for video.
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    async function resolve() {
      if (settings.mode !== "video") {
        setVideoSrc(null);
        return;
      }
      if (settings.videoSource === "url" && settings.videoUrl) {
        setVideoSrc(settings.videoUrl);
        return;
      }
      if (settings.videoSource === "upload") {
        try {
          const blob = await idbGetBlob(BG_VIDEO_KEY);
          if (blob && !cancelled) {
            objectUrl = URL.createObjectURL(blob);
            setVideoSrc(objectUrl);
          }
        } catch {
          setVideoSrc(null);
        }
      }
    }
    resolve();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [settings.mode, settings.videoSource, settings.videoUrl, settings.uploadVersion]);

  return (
    <div className="fixed inset-0 -z-10">
      {settings.mode === "image" && imageSrc ? (
        <div
          className="absolute inset-0 bg-ink bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
      ) : settings.mode === "video" && videoSrc ? (
        <video
          className="absolute inset-0 h-full w-full object-cover bg-ink"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <DefaultBackground />
      )}

      {/* consistent readability scrim over whatever is behind it */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/35 to-ink/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(21,14,36,0.55)_100%)]" />
    </div>
  );
}
