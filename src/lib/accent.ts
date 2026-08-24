import type { AccentKey } from "../types";

export const ACCENTS: Record<AccentKey, { label: string; rgb: string; hex: string }> = {
  ember: { label: "Ember", rgb: "232 149 107", hex: "#E8956B" },
  rosewood: { label: "Rosewood", rgb: "201 123 132", hex: "#C97B84" },
  sage: { label: "Sage mist", rgb: "141 178 158", hex: "#8DB29E" },
  lavender: { label: "Lavender", rgb: "163 148 214", hex: "#A394D6" },
};

export function applyAccent(key: AccentKey) {
  document.documentElement.style.setProperty("--accent", ACCENTS[key].rgb);
}
