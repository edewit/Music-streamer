# Copilot Instructions for Music-streamer

- **Tech stack**: SvelteKit (Vite) frontend, TailwindCSS via PostCSS, Express backend in ESM (`index.mjs`), NodeID3 for ID3 tags, CORS enabled, static assets in `public/`.
- **Run dev**: `npm install`, then `node index.mjs` (serves music API + static `public/` on :3000) and `npm run dev` (Vite/SvelteKit on :5173). Frontend fetches the backend on `http://localhost:3000`.
- **Quality checks**: `npm run check` (svelte-check), `npm run check:watch`, `npm run lint`. Build with `npm run build`; preview with `npm run preview`.
- **Music source**: Backend expects a `music/` directory in repo root containing MP3 files. API responses are just filenames; no database. Missing cover art falls back to `public/empty.png`.

## Architecture & Data Flow
- **Backend routes (`index.mjs`)**:
  - `GET /music/!` → array of file names from `music/`.
  - `GET /music/:file` → streams MP3 with HTTP range support (serves partial 206 or full 200; content-type `audio/mp3`).
  - `GET /music/cover/:file` → reads ID3 image via NodeID3; returns 404 if absent.
  - `GET /music/info/:file` → returns `{ artist, title }` from ID3 tags; no persistence.
  - Serves static files from `public/` (landing page, `empty.png`).
- **Frontend route**: `src/routes/+page.svelte` renders `<Player/>`; layout imports global Tailwind styles.
- **Player flow (`src/components/Player.svelte`)**: on mount fetches `/music/!` to populate list; reactive `src` builds audio URL and instantiates `new Audio(...)`; play/pause toggles via `player`; cover + tag data fetched per selection.
- **Music list (`MusicList.svelte`)**: displays filenames; dispatches `play` event with the selected song.
- **Cover art (`CoverArt.svelte`)**: builds cover/info URLs from `song`; `await` block shows artist/title when available; `on:error` swaps image to `http://localhost:3000/empty.png`.

## Conventions & Patterns
- **ESM everywhere**: `type: module`; use `import` syntax, not `require`.
- **Ports & URLs**: frontend hardcodes `http://localhost:3000` for API/media/cover/info; adjust together if backend port changes.
- **Styling**: Tailwind utilities only; globals live in `src/index.css`, pulled in via layout.
- **Event dispatch**: child components (`MusicList`) use Svelte `createEventDispatcher` to bubble events to `Player`.
- **Assets**: add new static placeholders under `public/`; backend already serves them.

## Notes & Gotchas
- Creating a new `Audio` instance happens on every `src` change; keep that behavior unless intentionally refactoring playback lifecycle.
- No persistence layer in use; `db-test.mjs` is a standalone Mongo/mongoose snippet not wired into the app.
- Keep range/streaming logic intact when adjusting `/music/:file` to preserve seek support.
- Ensure `music/` files are readable by the server process; errors surface as 416 for bad ranges.
