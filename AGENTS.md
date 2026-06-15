# Wanderable Agent Notes

imtrying to keep it minimal, dont add instructino and long text and made up shits

- `CLAUDE.md` points here. Keep repo-local agent instructions in this file.
- Trust executable wiring over `README.md` IA sketches. `README.md` still describes the target product, but current behavior is defined by the Expo Router files under `app/`.

## Product Guardrails

- Product intent lives in `wanderable.md` and `README.md`: preserve `Import -> Reconstruct -> Edit -> View on map -> Share`.
- The map view is the hero output. Avoid turning this into a planner, social feed, or account-wall-first flow.

## App Shape

- Single Expo app, not a monorepo. Entry is `expo-router/entry` from `package.json`.
- Global app wiring starts in `app/_layout.tsx`: gesture handler, Reanimated, `app/global.css`, font loading, splash handling, `AppProviders`, and the root `Stack`.
- `app/(tabs)/_layout.tsx` is not a tab navigator. It is a headerless `Stack` gated by Supabase auth.
- Current routed screens are `index`, `auth`, `autoscan`, `trip-card`, `trip-view`, `trip-edit`, and `highlight-edit`.
- Expo API routes use `+api` filenames. Current example: `app/api/health+api.ts`.

## Data And State

- Auth/session state lives in `lib/auth.tsx` and `lib/supabase.ts`. Supabase auth persistence uses MMKV via `lib/storage.ts`, not AsyncStorage.
- Trip read/edit flows now use Supabase through `lib/trips/hooks.ts` and `lib/trips/queries.ts`.
- `trip-card`, `trip-view`, `trip-edit`, and `highlight-edit` all depend on authenticated Supabase data. If those screens break, inspect the query layer before changing UI code.
- Local SQLite currently only opens `wanderable.db` and sets WAL in `lib/local-db.ts`; it is not the main trip source.
- Prisma is CLI/codegen-only here: schema in `prisma/schema.prisma`, generated client in `generated/prisma`. Do not assume a runtime Prisma adapter is wired into Expo.

## Native / Platform Gotchas

- `@rnmapbox/maps` is installed through the Expo config plugin in `app.json` and used by `components/wanderable/TripMapMapbox.tsx`.
- Real Mapbox rendering needs `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` and a native dev build. Expo Go cannot load the native module.
- `components/wanderable/TripMap.tsx` currently always renders the Mapbox implementation; fallback messaging exists but is commented out.
- Image-picker copy is configured in `app.json`, but photo-library usage strings for a full first-run import flow are still incomplete for release review.

## Styling And Routes

- Uniwind is wired through `metro.config.js` with CSS entry `app/global.css` and DTS output `uniwind-types.d.ts`.
- If `className` typing breaks, check both `uniwind-types.d.ts` and `types/uniwind.d.ts`, plus `tsconfig.json` includes, before changing component code.
- Route typing is enabled with `experiments.typedRoutes` in `app.json`. If route types drift, start Expo once so `.expo/types` regenerates before adding casts.
- Use `constants/wanderableTheme.ts` for Wanderable colors/tokens instead of ad hoc hex values.

## Commands

- Package manager: `npm` only. Lockfile is `package-lock.json`.
- Install: `npm install`
- Dev server: `npm run start`
- Native run: `npm run ios`, `npm run android`
- Web run: `npm run web`
- Typecheck: `npx tsc --noEmit`
- Expo dependency sanity check: `npx expo install --check`
- Prisma generate after schema edits: `npm run prisma:generate`
- Prisma migrate requires local env: `npm run prisma:migrate`

## Verification

- Default verification is `npx tsc --noEmit`.
- After changing Expo dependencies or config plugins, also run `npx expo install --check`.
- After Prisma schema changes, run `npm run prisma:generate` before typechecking.
- There are no repo scripts for linting or tests right now. Do not claim you ran them unless you added them.

## Repo Facts Worth Not Guessing

- `.env.example` documents the required public env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`.
- `.env*.local` is gitignored.
- `eas.json` is present with `development`, `preview`, and `production` profiles, and `app.json` already has an EAS project ID. Do not say EAS is unconfigured.
