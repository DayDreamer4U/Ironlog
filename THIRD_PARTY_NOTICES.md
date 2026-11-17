# Third-party notices

The original Ironlog application code is provided under the MIT licence in LICENSE.

Runtime and development dependencies retain their own licences. Their exact versions are pinned in package-lock.json. Expo, React, React Native, React Native Web, AsyncStorage, Zod, Lucide and react-native-svg are third-party projects; this repository does not replace their licences.

No exercise provider's full dataset is bundled in the source archive. Downloads occur at the user's request:

- **wger** exercise text and labels: per-record attribution and licence are preserved in app data and shown on exercise details. HTML descriptions are converted to plain text. Initial wger data is additionally described as CC BY-SA 3.0 in project documentation; newer records can use other licences, such as CC BY-SA 4.0. The imported record's licence is authoritative. Wger images are not reused by the adapter because media licensing must be resolved separately.
- **Free Exercise DB / yuhonas**: repository declares public-domain data/images under the Unlicense. See https://github.com/yuhonas/free-exercise-db and its LICENSE.md. The app retains attribution/source links when downloading. Some equipment fields are missing.
- **API Ninjas**: proprietary service output under https://api-ninjas.com/tos. The free tier is for personal/noncommercial use and prohibits making its output available to third parties. The user's key is required; no API key, output or images from this provider are included in this archive. Keep personal backups containing its output private. Reassess licensing before publishing a commercial version.

Boditrax is a third-party product name. Ironlog is independent, is not endorsed by Boditrax, and does not authenticate with or access a Boditrax account. Users may enter their own measurements manually.
