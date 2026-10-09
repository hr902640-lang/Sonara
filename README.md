# SONORA

SONORA is an India-first music trend discovery service. It ranks legally obtained platform signals and links listeners to platform search or official release URLs. It does not host, stream, download, or store music files.

## Requirements

- Node.js 20.19 or newer
- npm
- PostgreSQL only when using live mode
- API credentials only for the corresponding live provider features

## Run locally in demo mode

1. Install dependencies with `npm ci`.
2. If `.env` does not already exist, create it from the example:
   - PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
3. Keep `SONORA_DATA_MODE=demo` in `.env`.
4. Start the app with `npm run dev`.
5. Open `http://localhost:3000`.

Demo records and their scores are illustrative fixtures, not current chart data. Demo platform links open platform searches and are not verified matches for a specific release.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SONORA_DATA_MODE` | No | `demo` (default) or `live`. Live mode never falls back to demo records. |
| `DATABASE_URL` | Live mode | PostgreSQL connection string used by Prisma. |
| `TREND_REFRESH_MINUTES` | No | Suggested external scheduler cadence; defaults to 15 minutes. |
| `CRON_SECRET` | For protected HTTP sync | Secret expected as `Authorization: Bearer <CRON_SECRET>` by `POST /api/sync`. |
| `YOUTUBE_API_KEY` | Optional | Enables YouTube Data API public India music-chart synchronization. |
| `SPOTIFY_CLIENT_ID` | Optional | Enables official Spotify catalog search when paired with its secret. |
| `SPOTIFY_CLIENT_SECRET` | Optional | Server-side Spotify client credential; never expose it in browser code. |
| `APPLE_MUSIC_KEY` | Not currently used | Reserved; no Apple Music adapter is enabled. |

Keep `.env` private and never commit real credentials. `.env.example` contains placeholders only.

## Live mode and database setup

1. Create a PostgreSQL database and set its connection string in `.env`.
2. Generate the Prisma client: `npx prisma generate`.
3. Create/update the schema: `npx prisma migrate dev --name init`.
4. Set `SONORA_DATA_MODE=live`.
5. To enable trend synchronization, configure `YOUTUBE_API_KEY`.
6. Run `npm run sync:trends`, or schedule that command at the desired cadence.
7. Alternatively, invoke `POST /api/sync` with `Authorization: Bearer <CRON_SECRET>`.

The seed command (`npm run db:seed`) adds the illustrative fixture catalog and score rows to a demo/test database only. It refuses to run when `SONORA_DATA_MODE=live`, and seeded fixture records are excluded from live results.

The first saved live snapshot has no score-change value. Later syncs compare its score with the preceding stored snapshot. Sync writes each provider's batch transactionally so a failed batch is not partially persisted.

## Provider capabilities and limitations

- **YouTube:** `YOUTUBE_API_KEY` enables the official Data API `videos.list` most-popular music category query for India. It is the only enabled trend provider. The API's channel title is a channel/uploader name and is not guaranteed to be the performing artist.
- **Spotify:** client credentials enable official catalog search and metadata enrichment. Spotify's public API does not provide the India trending chart used here, so Spotify search results are not shown as trend rankings.
- **Apple Music, Instagram, JioSaavn, Amazon Music, SoundCloud:** shown as unavailable until a documented, permitted integration that supports the required feature is implemented. SONORA does not scrape websites or call private endpoints.

Configured credentials indicate configuration only; provider availability is confirmed only after a successful request. Verify sync outcomes in the command report and the database's `ProviderSyncStatus` records.

## Routes

- `/` — dashboard, language filters, and API-backed search
- `/trending` — full current demo/live trend listing
- `/search` — demo fixture search or configured provider catalog search
- `/song/[slug]` — song metadata and official platform links
- `/settings` — current data mode and provider configuration status
- `/library` — informational page; accounts and favorites are not implemented
- `GET /api/trending` — trend list and provider status
- `GET /api/search?q=...` — search (queries are limited to 120 characters)
- `GET /api/songs/[slug]` — song detail
- `POST /api/sync` — protected live synchronization endpoint

## Development checks

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build
```

The lint command runs ESLint; type-checking is listed separately. The test suite covers trend scoring, normalization, provider declarations, and conservative cross-provider duplicate matching.

## Project layout

- `app/` — Next.js pages, API routes, global styles
- `components/` — reusable discovery and song-detail UI
- `lib/` — provider integrations, sync/persistence, normalization, ranking, and matching
- `prisma/` — PostgreSQL schema and optional demo seed
- `jobs/` — scheduler-friendly sync command
- `tests/` — Node test-runner coverage

## Troubleshooting

- If Prisma reports that its client is missing, run `npx prisma generate`.
- If a live route reports a database setup error, verify `DATABASE_URL` and apply migrations.
- If synchronization returns a provider error, check its key, API quota, and `ProviderSyncStatus`.
- An empty live dashboard before a successful sync is expected; demo data is never substituted into live mode.
# Sonara
