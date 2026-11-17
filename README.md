# Ironlog

An Android workout and body-composition journal. Your routines, calendar, sessions, photos and body readings live on your phone. No login, analytics or cloud database.

**Start with [START_HERE.md](START_HERE.md).** Full Android install/build instructions are in [docs/ANDROID.md](docs/ANDROID.md). This repository contains the source project, not a prebuilt APK.

## Included

- Create, duplicate, edit, delete and reorder routines and exercises.
- Independent default weight and rep values for every set.
- Total, per-side, per-dumbbell, bodyweight-added-load and assistance modes; kg/lb per exercise and configurable bar/starting resistance.
- Date calendar, one-off plans, weekly repetitions and rotating routine/rest cycles.
- Set and exercise checklists, warmup sets, session notes, extra sets and unfinished-workout resume.
- Change today’s weights without changing the routine. Display the previous completed exercise session beneath the current entry. Explicitly update defaults when wanted.
- Manual or automatic rest timers, pause/resume, quick durations and scheduled local Android notifications.
- Workout history, exercise load trends and working-set volume charts.
- Custom exercises, searchable muscles/equipment and personal machine photos.
- Two exercise API adapters: wger and API Ninjas. An additional Free Exercise DB downloadable catalogue provides images.
- Personal profile and dated manual Boditrax-style readings, including segmental readings, custom numeric fields, charts and CSV exchange.
- Full JSON backup/restore including machine photos. API keys are excluded.

## Development

Install Node.js 24, then:

```bash
npm ci
npm start
```

Use the compatible Expo Go app on Android to preview during development. It needs to match this project’s Expo SDK 58. The standalone APK is the final offline app; it does not depend on the development server. For a browser-only development preview, use `npm run preview:web`. The browser preview uses local browser storage and cannot verify native alarms, secure storage or Android file sharing.

```bash
npm run check          # TypeScript and automated tests
npm run export:android # Production Android JS/Hermes bundle
npm run prebuild:android # Generate Android native project
npm run version:bump   # Increment patch version and Android build number
```

The generated `android/` directory is ignored. Configure native settings through `app.json`, then regenerate. Commit `package-lock.json`; use `npm ci` for repeatable installs. Do not update Expo, React and React Native independently: use Expo’s compatibility tooling and review the upgrade guide.

## Project map

| Path | Purpose |
| --- | --- |
| `App.tsx` | Navigation, active workout and recovery screen |
| `src/model.ts` | Validated data model, session snapshots, calendar and load calculations |
| `src/store.tsx` | Persistent local state, serialized saves and timer operations |
| `src/data.ts` | Starter exercise labels and body metric definitions |
| `src/screens/` | Today, routines, workout, calendar, progress and profile |
| `src/components/` | Shared mobile controls, charts, exercise library and timer |
| `src/services/catalogue.ts` | Provider adapters and normalization |
| `src/services/notifications.ts` | Native local rest notifications |
| `src/services/files.ts` | Native import, export and permanent machine photos |
| `src/services/backup.ts` | Portable backups and body measurement CSV |
| `tests/` | Domain, provider contract and screen-flow checks |
| `.github/workflows/` | Checks and manually triggered signed APK build |
| `docs/` | Installation, architecture, privacy and source references |

## Data and privacy

Workouts and body readings stay in local app storage. Android automatic backup is disabled in this project configuration. Uninstalling or clearing app data removes local records: export a backup first. Backups are unencrypted personal files, and you decide their destination in Android’s share sheet. Store them privately.

An exercise download or lookup contacts only the chosen public provider. API Ninjas receives the exercise name query and your own API key. It does not receive your profile, session log or measurements. Remote exercise images are fetched from their hosting provider when displayed; downloaded catalogue text is saved offline. Personal machine photos are copied to the app’s document storage. API keys are stored using Expo SecureStore on Android and are not embedded in the app or committed to Git.

Boditrax values are **entered manually or imported using the documented Ironlog CSV format**. There is no Boditrax account connection, automatic scan, proprietary report parser or medical interpretation. Create custom fields for any additional values on your report.

## Exercise data conditions

- **wger:** public exercise endpoints need no API key. Per-record author/source/licence metadata is retained. Descriptions are converted from HTML to plain text; labels are normalised. Images are not reused by this adapter because media can have separate licences.
- **API Ninjas:** bring your own free key. The free plan is personal/noncommercial, excludes third-party sharing of output, and does not include exercise images. The app requests only basic search results. Keep backups containing its output private. A key is not included; the live authenticated API could not be tested without one.
- **Free Exercise DB:** optional additional JSON dataset, not a second REST API. Its repository declares the Unlicense and provides muscle/equipment fields and images. Some equipment values are missing. It can supplement wger and the API Ninjas adapter.
- Starter exercise names and muscle/equipment labels are editable organisational examples, not externally validated coaching instructions. Download a sourced exercise or enter instructions from your trainer where needed.
- Catalogue equipment is often generic. Add your actual gym’s machine name, setup notes and photo yourself.

See [docs/SOURCES.md](docs/SOURCES.md) for primary references and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution.

## Updating the app safely

Code and personal records are separate. Changing code does not require uploading your workout data to GitHub. Keep the Android package ID and signing key unchanged, increment `versionCode`, build the new APK and install it over the existing version. Export a backup before updates. Never uninstall as an update step.

When changing the saved-data format, add a migration before changing `schemaVersion`. Existing snapshots are validated on startup, and invalid data is retained for recovery rather than overwritten. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Validation scope

TypeScript, automated domain/provider/screen-flow tests, Android/web bundle exports and Expo native prebuild are run during preparation. These do not replace installing a signed APK on a real Android device. Native Gradle APK compilation and locked-screen notification delivery require the Android build and device checks in [docs/ANDROID.md](docs/ANDROID.md). Provider availability and free-plan conditions may change.
