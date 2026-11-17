# Architecture and future changes

## Storage boundaries

`src/store.tsx` keeps one versioned JSON document in native AsyncStorage (`ironlog.state.v1`). Each state change is queued for persistence in order, so an older slow write cannot overwrite a newer state. Failed writes show a retry banner. App backgrounding queues another save. A successful save is durable across ordinary restarts; abrupt process termination before a queued save completes can lose the latest unflushed edit.

This app deliberately has no backend, account or cloud sync. SecureStore holds the optional API Ninjas key separately. Files contains copied machine photos. `android.allowBackup` is false. A manual full export embeds machine photos so they can move to another device; notification IDs/deadlines and secure keys are not restored.

On startup, Zod validates stored data before opening it. Invalid state is not overwritten with an empty app. The recovery screen can export the original raw record or restore a validated full backup. Validation errors leave the original file intact until the user explicitly restores.

## Routine versus session

A routine item holds default sets and exercise-specific load conventions. Starting a session copies these values plus exercise name/muscle/equipment labels into a session snapshot. Actual sets, warmup flags and notes belong to the snapshot. Changing actual values never mutates defaults. The “Update routine defaults” action explicitly copies current non-warmup sets and notes back to the matching routine item. Historical sessions keep their snapshots.

The last-session hint finds the most recent completed session before the active session that contains a checked set for the same catalogue exercise ID. Duplicate exercises imported from different providers have different IDs; their histories are independent. If you switch provider records, add the desired exercise deliberately rather than assuming automatic matching.

## Load convention

- Total: recorded weight is the total selected load.
- Per side: total external load = recorded load × 2 + configured bar/starting resistance.
- Per dumbbell: total external load = recorded load × 2.
- Bodyweight: recorded number is added external load. Body mass is not inferred.
- Assisted: recorded number is assistance, not load lifted. Less assistance can be harder.

Volume charts sum completed, non-warmup sets × reps × total external load converted to kg. Bodyweight and assisted movements are excluded from these charts. A leg press sled or Smith starting resistance is user-configurable; no default equipment mass is assumed reliable. Machine numbers are the displayed machine load, not a biomechanical force estimate.

## Calendar

Calendar keys are local `YYYY-MM-DD` dates, generated from local year/month/day rather than UTC `toISOString()`. Date arithmetic uses local noon to avoid midnight/DST boundary surprises. Weekly schedules and rotating cycles expand into dated entries. Duplicate date/routine combinations merge; individual entries remain removable. Starting any plan records the actual training date, not the date of a future selected calendar cell.

## Timer

The visible countdown derives from `endAt - Date.now()`, not from decrementing a JavaScript counter. A serialized timer operation queue cancels old notifications before scheduling a replacement. Notification failures leave the visible timer running and show the reason. Pausing stores remaining seconds. The native adapter uses scheduled local notifications; the web adapter explicitly reports that native alerts are unavailable.

## Adding features

- Add a screen under `src/screens`; add a tab or a sheet from `App.tsx`.
- Add provider adapters under `src/services/catalogue.ts`; preserve record IDs, source, attribution, licence and normalization details. Avoid assuming a remote image shares the exercise text licence.
- Add built-in body fields in `METRICS` with a stable key. Do not rename saved keys without migrating their values. Custom fields already support additional numeric readings.
- Use immutable state updates through `update`. Do not mutate arrays inside the store.
- On a schema change, implement a `migrateSavedState(raw)` function before parsing with the new schema. Add tests from the old format and update the backup parser. Do not simply increment `schemaVersion` and strand existing users.
- Keep `.web.ts` implementations when adding native-only capabilities so the browser development preview still bundles.
- Keep the Android package ID and signing key stable across updates. Increment `versionCode` using the supplied script.

## Tests and limits

`npm run check` runs strict TypeScript and Vitest domain/provider/UI-flow checks. Native bundle export and Expo prebuild validate additional integration. Browser-style screen tests do not emulate Android alarms, filesystem permissions, secure key storage or final native UI/layout. Run the physical-device checklist before using a release as your only record. The supplied GitHub workflow automates native APK compilation once signing credentials are provided.
