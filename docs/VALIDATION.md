# Validation record — 17 November 2026

## Passed

- Strict TypeScript check of application source.
- **34 automated checks** across four test suites.
- Domain checks: routine/session separation, previous-session selection, total/per-side/dumbbell loads, kg/lb normalization, volume exclusions, real calendar dates, rotating schedules and duplicate-plan merging.
- Backup checks: workout and body-data roundtrip, custom metrics, embedded images, resetting timer identities, invalid formats/references and multiple unfinished sessions.
- CSV checks: zero/decimal values, quoted/multiline notes, unknown columns, invalid percentages and invalid dates.
- Provider contract checks: wger translation/muscle/equipment/attribution mapping, API Ninjas equipment/query/key mapping, Free Exercise DB images and rate-limit handling. These use controlled responses.
- Screen-flow checks: create routine → log heavier set → finish → start next session with original defaults and previous-session hint; save profile/body reading; calendar persistence after reopening.
- Native notification adapter checks: channel/permission order, schedule inputs, denied permissions, cancellation and exact-alarm permission request. These mock Android APIs.
- Production Android JavaScript/Hermes bundle export and browser JavaScript bundle export.
- Expo Android native prebuild. Generated manifest inspected for disabled automatic backup and declared exact-alarm permission.
- Release signing configuration transformation against the generated Gradle project, using test-only environment values and no actual signing key.
- Version increment helper checked against temporary copies of configuration files.
- A live unauthenticated wger exerciseinfo response was retrieved to confirm the current response shape.

## Not verified here

- A signed APK has not been compiled with Gradle or installed on a physical Android device. This workspace has no configured Android SDK/device.
- GitHub-hosted APK compilation has not been run; it needs a repository and your signing secrets.
- API Ninjas live authenticated responses have not been exercised because no personal API key was supplied.
- Physical-device keyboard/layout, file sharing, photo permissions, SecureStore and locked-screen alarm behavior need the acceptance checklist in ANDROID.md. Screen-flow tests run with web components and mocked native interfaces; they are not Android instrumentation tests.
- An attempted local visual browser preview was unavailable in this workspace. Bundle compilation and screen-flow tests passed; there is no claim of a visual device review.
- Online dependency-directory validation timed out; dependencies were installed using Expo's SDK-matched versions and local compatibility data, and the installed project compiled. The offline compatibility check reports its own validation limits.
