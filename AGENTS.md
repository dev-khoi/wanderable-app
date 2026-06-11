# Wanderable Agent Notes

- `CLAUDE.md` delegates here; keep this as the single repo-local instruction file.
- Read the Expo SDK 54 docs before changing framework setup: https://docs.expo.dev/versions/v54.0.0/

## Source Of Truth

- Product intent lives in `wanderable.md`, not in the starter app screens.
- Preserve the core loop: `Import -> Reconstruct -> Edit -> View on map -> Share`.
- The map view is the hero output. Avoid adding planner/social-feed patterns or blocking onboarding/edit flows.

## App Shape

- Single Expo Router app. Entry is `expo-router/entry` from `package.json`; this is not a monorepo.
- Root wiring is `app/_layout.tsx`: gesture handler, reanimated, `app/global.css`, font loading, splash handling, and `AppProviders` all start there.
- `app/(tabs)/_layout.tsx` is a headerless `Stack`, not a real bottom tab navigator. Verified routes today: `index`, `auth`, `autoscan`, `trip-card`, `trip-view`, `trip-edit`.
- `README.md` still describes the target IA with Trips / Map / Profile. The executable app is still a prototype flow, so trust the route files and `app/(tabs)/_layout.tsx` for what actually exists.
- Expo Router API routes use `+api` filenames; current example is `app/api/health+api.ts`.

## Installed Stack That Changes Decisions

- Native modules already in use: `react-native-mmkv`, `react-native-reanimated`, `react-native-gesture-handler`, `expo-sqlite`, `expo-symbols`, `@rnmapbox/maps`.
- `@rnmapbox/maps` is configured via the Expo config plugin in `app.json`. The native map only works in a dev build; Expo Go falls back because the native module is unavailable there.
- Mapbox runtime token is `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env` / `.env.example`.
- React Query is initialized once in `lib/providers.tsx` with a shared `QueryClient`.
- Supabase client setup is in `lib/supabase.ts` and expects `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Supabase auth persistence uses MMKV in `lib/storage.ts`, not AsyncStorage.
- Local device SQL currently goes through `lib/local-db.ts` with `expo-sqlite`.
- Prisma is codegen-only right now: schema in `prisma/schema.prisma`, generated client in `generated/prisma`. There is no verified Expo runtime adapter setup in the repo yet.
- There is no EAS config or CI workflow checked in. Do not assume a store-build pipeline exists in-repo.

## Styling And Types

- Uniwind is wired through `metro.config.js` and `app/global.css`; the CSS sources are `app`, `components`, and `lib` only.
- `className` support for React Native components is declared in `types/uniwind.d.ts`, while Metro is configured to emit `uniwind-types.d.ts`. If `className` types break, check both files plus `tsconfig.json` includes before changing component code.
- Wanderable UI colors now live in `constants/wanderableTheme.ts`; the companion reference doc is `docs/wanderable-color-theme.md`. For Wanderable screens/components, prefer those tokens over raw hex or inline `rgba(...)` strings.
- Reusable Wanderable UI primitives live in `components/wanderable/index.tsx`; the Mapbox trip-map wrapper lives in `components/wanderable/TripMap.native.tsx` with a web/native-unavailable fallback in `components/wanderable/TripMap.tsx`.
- The current trip prototype uses `lib/mockData.ts` as shared in-memory state between `trip-view` and `trip-edit`; do not add persistence assumptions when editing those screens.
- After changing Metro or Uniwind config, restart Metro.
- `app.json` has `experiments.typedRoutes = true` and `tsconfig.json` includes `.expo/types/**/*.ts`. If route string types look wrong, start Expo once to regenerate route types before adding broad casts.

## Commands

- Use `npm`; the repo is locked with `package-lock.json`.
- Install: `npm install`
- Start dev server: `npm run start`
- Start targets: `npm run android`, `npm run ios`, `npm run web`
- For native Mapbox work, use a dev build (`npx expo run:ios` / `npx expo run:android`) instead of Expo Go.
- Typecheck: `npx tsc --noEmit`
- Sync Prisma client after schema edits: `npm run prisma:generate`
- `npm run prisma:migrate` exists, but it needs `DATABASE_URL` in local env.
- There are currently no repo scripts for linting or tests. Do not claim you ran them unless you added them.

## Verification

- Default verification for code changes is `npx tsc --noEmit`.
- For Expo dependency changes, also run `npx expo install --check`.
- For Prisma schema changes, run `npm run prisma:generate` before typechecking.

## Apple Review

- The product's first-run flow is permission-driven photo import. If you add photo-library access for a release build, add the iOS permission usage strings in app config before submission; `app.json` does not currently define photo permission copy.
- Keep account creation optional in the reviewable path unless the product truly requires it. The repo's product docs explicitly say onboarding should be short and permission-driven, not an account wall.
- Avoid shipping dead-end placeholder CTAs in a reviewable build. Reviewers should be able to move from onboarding to scanning to a coherent trip result without hidden setup.
- If you add Supabase auth or cloud-source connectors to the review path, include review credentials/instructions in App Store review notes; otherwise keep those integrations optional so the core photo-reconstruction value is still testable.
