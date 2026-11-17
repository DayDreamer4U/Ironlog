# Start here — Ironlog for Android

You have a complete source project. It must be built into an APK before normal installation on your phone. You do not need a cloud database or a workout account.

## 1. Put the code in your GitHub repository

1. Extract this ZIP on your computer.
2. Create a new GitHub repository, such as `ironlog`. A private repository is a sensible default for a personal project.
3. Upload the **contents** of the `ironlog` folder, keeping the folder structure. Ensure `.github/workflows`, `.gitignore`, `package.json` and `package-lock.json` are included. GitHub Desktop or Git is easiest; hidden folders can be missed when uploading through a browser.

With Git installed, run in the project folder, replacing the URL with your own:

```bash
git init
git add .
git commit -m "Initial Ironlog app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ironlog.git
git push -u origin main
```

Do not upload `node_modules`, generated Android builds, signing keys, API keys, or your workout backups.

## 2. Choose how to build your APK

**Simplest first build: Expo Build.** Install Node.js 24 on your computer and follow route A in `docs/ANDROID.md`. Expo handles Android compilation and can manage the signing key. A build service compiles the source; it does not store your future workout/body records. Your standalone app stores those on your phone.

**Build from GitHub:** route B in `docs/ANDROID.md` explains the included “Build Android APK” Action. You set up a signing key once, save it in GitHub Secrets, and then click Run workflow whenever you need a new APK.

**Build entirely on your own computer:** route C uses Android Studio and the generated Gradle project.

Use one signing-key route consistently. Switching from Expo’s key to a different GitHub key prevents installation over the existing app; either reuse/import the original key or export your backup and migrate deliberately.

## 3. Install and use

1. Download the APK onto your Android phone and open it.
2. Android may ask you to allow this source to install apps. Enable it only for the source you are using.
3. Open Ironlog → **Routines** → create a routine → add exercises.
4. Set each exercise’s weight mode, sets, reps, default load, bar resistance and rest time.
5. Use **Calendar** to plan one day, repeated weekdays or a rotating cycle.
6. Start your routine from **Today**, **Calendar** or **Routines**.
7. Edit today’s weights/reps and check sets or the whole exercise. Tap the set number to mark a warmup.
8. Finish the workout. Next time, routine defaults return and your last session appears beneath them.
9. Open **You** to add personal details and body/Boditrax readings. Use **Show all metrics** for segmental readings.
10. In **You → Settings**, enable precise Android rest alerts if wanted and export a full backup periodically.

## 4. Add exercise information

In **Routines → Browse exercise library**, download wger or Free Exercise DB. Both work without an API key. Catalogue descriptions and labels are available offline after download; remote images need connectivity.

For the second REST API, get a free API Ninjas key at https://api-ninjas.com/register, enter it in **You → Settings**, and use **Search API Ninjas** in the exercise library. Free-plan images are not included. No account or key is needed for workout logging itself.

## 5. Add new features later

Keep the repository and this source ZIP. For a future change, describe the desired behavior and share the current source. Implement the feature, run `npm run check`, increment the version with `npm run version:bump`, commit/push the change, and rebuild using the **same Android package and signing key**.

Do not upload personal backups when asking for a code change. Source files are enough unless you explicitly need data recovery.
