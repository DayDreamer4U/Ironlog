# Build, install and update the Android app

## Route A — Expo Build (easiest setup)

Prerequisites: Node.js 24, an Expo account, project folder extracted on your computer. The build service receives app source and build credentials, not future workout records. Build-service pricing/queue allowances are controlled by Expo; check your account before using it.

In the project folder:

```bash
npm ci
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```

If asked whether to generate a new Android keystore, generate one for your first build. **Keep that signing key for all updates.** The preview profile in `eas.json` requests an installable APK. Follow the returned build link to download it on your Android phone. You do not need a Play Store listing.

`build:configure` can add an Expo project ID to `app.json`. Commit your updated configuration. The app sets `updates.enabled: false`: code updates are delivered by rebuilding and installing an APK, not by an automatic remote-update service.

To use the GitHub build route later, export the same signing credentials using Expo’s credentials manager rather than generating a different key:

```bash
npx eas-cli@latest credentials --platform android
```

## Route B — Included GitHub APK workflow

This route builds on a GitHub runner and does not require an Expo account. GitHub Actions usage depends on your repository/account allowance. The workflow is manual; ordinary commits run tests and bundle checks.

### One-time signing setup

Install a JDK (Android Studio includes one), then open a terminal in the project folder:

```bash
mkdir signing
keytool -genkeypair -v -storetype PKCS12 -keystore signing/ironlog.jks -alias ironlog -keyalg RSA -keysize 2048 -validity 10000
```

Choose a strong keystore password and keep the file/password securely. Use the same value as the key password for this PKCS12 keystore. The identity questions can use your own private/personal project identity. The generated `signing/` folder is ignored by Git. **Never commit the keystore or its base64 text.**

On Windows PowerShell, encode the file:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes((Resolve-Path 'signing/ironlog.jks'))) | Set-Content -NoNewline 'signing/ironlog-base64.txt'
```

On macOS/Linux:

```bash
base64 < signing/ironlog.jks | tr -d '\n' > signing/ironlog-base64.txt
```

In your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret**, create:

| Secret | Value |
| --- | --- |
| `IRONLOG_KEYSTORE_BASE64` | Entire contents of the generated base64 text file |
| `IRONLOG_STORE_PASSWORD` | Your keystore password |
| `IRONLOG_KEY_ALIAS` | `ironlog` |
| `IRONLOG_KEY_PASSWORD` | The key password (same as store password for the setup above) |

### Build and download

1. Ensure `.github/workflows/build-apk.yml` is on your default branch.
2. Open **Actions → Build Android APK → Run workflow**.
3. Wait for the run to complete. It installs dependencies, checks the app, generates native code, configures your release signing key and builds an APK for ARM Android phones.
4. Open the finished run, download the **ironlog-android-apk** artifact, unzip it and transfer `app-release.apk` to your phone.
5. Install it. Grant notification permission when using the rest timer.

The workflow fails early if signing secrets are missing. It does not use a shared debug key for a release. It uploads only the APK artifact, not the key. The workflow was supplied and its signing transformation checked locally; an actual GitHub-hosted Gradle build has not been run from this workspace.

## Route C — Build on your computer

Install Node.js 24, JDK 21 and Android Studio/SDK. Configure `ANDROID_HOME` and install the SDK/build tools requested by the generated project. Run:

```bash
npm ci
npx expo prebuild --platform android --no-install
```

Set the four environment variables used by `scripts/configure-signing.mjs`. `IRONLOG_STORE_FILE` must be the **absolute path** to your keystore; the other three are its store password, alias and key password. Do not put them in committed files.

```bash
node scripts/configure-signing.mjs
cd android
./gradlew assembleRelease
```

On Windows, use `gradlew.bat assembleRelease`. The APK is in `android/app/build/outputs/apk/release/app-release.apk`. Running the generated Gradle release build without the signing script uses Expo’s development signing configuration; do not distribute that as your maintained personal release.

## Rest alerts

- The in-app countdown uses an absolute deadline, so it catches up after the screen is locked.
- Local notifications are scheduled through Expo Notifications; no push server is used.
- Allow notifications. In **You → Settings → Enable precise Android rest alerts**, allow Alarms & reminders if you want precise scheduling. Permission behavior depends on Android version.
- Android/OEM battery management can still affect delivery. If alerts are late, check notification settings and battery restrictions for Ironlog.
- Pause, reset, a new timer, finishing or discarding a workout cancels the prior scheduled rest notification.
- Force-stopping the app can prevent alarms until it is reopened. The displayed countdown recovers from its stored deadline when reopened.

## Update without losing records

1. Export a full JSON backup in Ironlog first.
2. Keep `expo.android.package` as `com.ironlog.personal` (or the identifier you chose before the first install).
3. Keep the original signing key. Android requires compatible signatures for an in-place update.
4. Run `npm run version:bump`; commit the updated files.
5. Build an APK with the same signing route/key.
6. Open the APK on your phone and choose **Update**. Do not uninstall the old app.

If Android says “App not installed,” check signing key, package identifier, versionCode and Android version. Do not solve a signature mismatch by uninstalling until you have exported a backup. Source and backups are different: GitHub preserves code; your phone/exports preserve workout records.

## Real-device acceptance checklist

Before relying on the app for your only workout record:

- Create a routine, change one day’s weights, finish it and confirm the next session uses defaults plus the previous-session text.
- Lock the phone during a short timer and check sound/notification delivery; test pause/reset and expiry after reopening.
- Close/reopen during a workout and confirm weights/checkmarks remain.
- Test a dated calendar plan and a rotating cycle.
- Record/edit a body reading, including a custom field and zero value.
- Add a machine photo; export a backup; restore it and confirm the photo and records remain.
- Install your next signed APK over the first and confirm records survive.

## Official references

- [Expo: building installable APKs](https://docs.expo.dev/build-reference/apk/)
- [Android: app signing](https://developer.android.com/studio/publish/app-signing)
- [Expo: local notifications and permissions](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [GitHub: manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)
