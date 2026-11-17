# Primary sources

Checked during preparation on 17 November 2026. External service terms and software versions can change.

| Topic | Primary reference | How used |
| --- | --- | --- |
| wger public API | https://wger.readthedocs.io/en/latest/api/api.html | Authentication requirements, JSON endpoints, pagination |
| wger exercise representation | https://github.com/wger-project/wger/blob/master/wger/exercises/api/views.py | Expanded read-only exerciseinfo endpoint |
| wger live example | https://wger.de/api/v2/exerciseinfo/?limit=1 | Confirmed translation, muscle, equipment and licence response shape |
| wger licences | https://wger.readthedocs.io/en/stable/ | Initial dataset licence; actual imported record metadata is preserved |
| API Ninjas Exercises | https://api-ninjas.com/api/exercises | Search parameters, API key, muscle/equipment fields and paid-only images |
| API Ninjas terms | https://api-ninjas.com/tos | Personal/noncommercial free use and third-party output-sharing restrictions |
| Free Exercise DB | https://github.com/yuhonas/free-exercise-db | Optional JSON catalogue and images, incomplete equipment fields |
| Dataset licence | https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md | Declared Unlicense |
| Expo Notifications | https://docs.expo.dev/versions/latest/sdk/notifications/ | Local alerts and Android permissions |
| Expo file picker | https://docs.expo.dev/versions/latest/sdk/document-picker/ | User-selected file imports |
| Expo APK builds | https://docs.expo.dev/build-reference/apk/ | Installable APK build profile |
| Android app signing | https://developer.android.com/studio/publish/app-signing | Signing continuity for updates |
| GitHub manual workflows | https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow | Run-workflow instructions |
| Boditrax | https://boditrax.com/ | Product context only; no integration or affiliation claimed |

Body field labels are app input definitions. Users enter device-reported numbers; no device readings, reference ranges or medical claims are generated. Starter muscle/equipment labels are editable examples, not a validated training reference. The app preserves the source on imported exercise records so provenance can be reviewed in the library.
