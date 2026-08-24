import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function NextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5v14l10-7L5 5Z" fill="currentColor" stroke="none" />
      <rect x="17" y="5" width="2.2" height="14" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PrevIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M19 5v14L9 12l10-7Z" fill="currentColor" stroke="none" />
      <rect x="4.8" y="5" width="2.2" height="14" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShuffleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h3.5c1.5 0 2.4.6 3.3 1.8l5.4 8.4c.9 1.2 1.8 1.8 3.3 1.8H21" />
      <path d="M17 4l4 3-4 3" />
      <path d="M3 18h3.5c1.5 0 2.4-.6 3.3-1.8l.6-.9" />
      <path d="M14.6 8.7l.6-.9c.9-1.2 1.8-1.8 3.3-1.8H21" />
      <path d="M17 20l4-3-4-3" />
    </svg>
  );
}

export function RepeatIcon({ variant = "all", ...props }: SVGProps<SVGSVGElement> & { variant?: "off" | "all" | "one" }) {
  return (
    <svg {...base} {...props}>
      <path d="M17 2.5l3.5 3.5L17 9.5" />
      <path d="M20.5 6H7a4 4 0 0 0-4 4v1" />
      <path d="M7 21.5L3.5 18 7 14.5" />
      <path d="M3.5 18H17a4 4 0 0 0 4-4v-1" />
      {variant === "one" && (
        <text x="12" y="14" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">
          1
        </text>
      )}
    </svg>
  );
}

export function VolumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M16.2 8.8a5 5 0 0 1 0 6.4" />
      <path d="M18.6 6.4a8.5 8.5 0 0 1 0 11.2" />
    </svg>
  );
}

export function VolumeMuteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      <path d="M16.5 9.5l4.5 5M21 9.5l-4.5 5" />
    </svg>
  );
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 13.5a7.7 7.7 0 0 0 .1-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14.2 2h-4.4l-.4 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.7 7.7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9c.77.66 1.65 1.17 2.6 1.5l.4 2.5h4.4l.4-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.5Z" />
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15.5V4.5" />
      <path d="M7.5 9L12 4.5 16.5 9" />
      <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 14.5l5-5" />
      <path d="M11 6.5l1.3-1.3a3.8 3.8 0 0 1 5.4 5.4L16.3 12" />
      <path d="M13 17.5l-1.3 1.3a3.8 3.8 0 0 1-5.4-5.4L7.7 12" />
    </svg>
  );
}

export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4.5 17l5-5 3.5 3.5L17 11l3 3.5" />
    </svg>
  );
}

export function VideoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="6" width="12" height="12" rx="2" />
      <path d="M15.5 10l5-2.5v9L15.5 14" />
    </svg>
  );
}

export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" fill="currentColor" stroke="none" />
      <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 7h15" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
