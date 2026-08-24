# lofiwala

A calm, single-page lofi music site. Press play, and a YouTube playlist streams
in the background while a spinning vinyl record and an ambient, drifting
gradient keep things quiet and unhurried.

It's a static site — plain React + Vite, no backend, no database. Every
customization a listener makes (playlists, background image/video, accent
color, volume) is stored only in their own browser via `localStorage` and
`IndexedDB`. Nothing is ever sent to a server.

## What's inside

- **Playback** — the official YouTube IFrame Player API drives playback of a
  YouTube / YouTube Music playlist. The player itself is invisible; only the
  audio plays. Defaults to the playlist you gave me.
- **Custom playlists** — anyone can paste another YouTube/YT Music playlist
  link in Settings, name it, and switch between saved playlists. Links
  copied straight from YouTube Music (which prefix the ID with `VL`) are
  normalized automatically, and private lists (Liked Music, Watch Later)
  are called out with a clear message instead of failing silently.
- **Full screen** — a toggle (top-right, or press `F`) puts the whole page
  into the browser's full-screen mode, so the background — animated,
  image, or video loop — fills the entire screen with no browser chrome.
- **Background** — a default ambient animated gradient (drifting color
  blobs, a light dust-mote drift, subtle film grain, respects
  `prefers-reduced-motion`), or a user-supplied image/video, either pasted as
  a URL or uploaded from their device (stored in IndexedDB, on-device only).
- **Accent color** — four preset accent colors recolor the interactive
  elements (play button, active states, slider fill).
- **Branding** — a small "lofiwala.wtf" mark, bottom-left, low-opacity.

## Run it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Build for production

```bash
npm run build
```

This outputs a fully static site to `dist/`. `npm run preview` will serve
that build locally if you want to check it before deploying.

## Deploy

Because this is a static SPA, you can deploy it anywhere that serves static
files. Two easy options:

### Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repo (or run `vercel` from
   inside this folder with the [Vercel CLI](https://vercel.com/docs/cli)).
2. Import the repo in the Vercel dashboard. Vercel auto-detects Vite:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Deploy. `vercel.json` is already included so direct/deep links resolve
   correctly.

### Cloudflare Pages

1. Push this folder to a git repo and connect it in the Cloudflare Pages
   dashboard, **or** deploy directly with the CLI:
   ```bash
   npm install -g wrangler
   npm run build
   wrangler pages deploy dist
   ```
2. If using the dashboard, set:
   - Build command: `npm run build`
   - Build output directory: `dist`

`public/_redirects` is already included for correct SPA routing on Cloudflare
Pages (and Netlify, if you use that instead).

### Any other static host

Run `npm run build` and upload the contents of `dist/` — that's the entire
site.

## Customizing the default playlist

The default playlist lives in `src/lib/storage.ts` as `DEFAULT_PLAYLIST_ID`.
Change it to any YouTube playlist ID and rebuild if you want a different
default for new visitors — this doesn't affect anyone who has already picked
their own playlist locally.

## Notes

- `npm audit` may flag a moderate-severity advisory in `esbuild`'s dev
  server. It only affects `npm run dev` on an untrusted network and has no
  effect on the deployed production build, which is static files with no
  dev server involved.
- If a playlist is entirely private (Liked Music, Watch Later) or otherwise
  can't be embedded, the player shows a clear message rather than hanging
  silently. Individual unplayable tracks within an otherwise-good playlist
  are skipped automatically.
- Full screen requires a direct click or key press to activate — this is a
  browser security requirement, not something the app can bypass — so it
  can't be turned on automatically when the page loads.
