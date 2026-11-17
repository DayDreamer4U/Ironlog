import fs from 'node:fs';
// Generated native files stay out of Git. This runs after Expo prebuild.
for(const name of ['IRONLOG_STORE_FILE','IRONLOG_STORE_PASSWORD','IRONLOG_KEY_ALIAS','IRONLOG_KEY_PASSWORD']){
  if(!process.env[name])throw new Error(`Missing ${name}. Configure your signing secrets first.`);
}
const path='android/app/build.gradle';
let gradle=fs.readFileSync(path,'utf8');
const target=/release\s*\{\s*\/\/ Caution![\s\S]*?signingConfig signingConfigs\.debug/;
if(!target.test(gradle))throw new Error('Generated Gradle release signing block changed. Review the prebuild template before building.');
gradle=gradle.replace('    signingConfigs {',`    signingConfigs {
        ironlogRelease {
            storeFile file(System.getenv('IRONLOG_STORE_FILE'))
            storePassword System.getenv('IRONLOG_STORE_PASSWORD')
            keyAlias System.getenv('IRONLOG_KEY_ALIAS')
            keyPassword System.getenv('IRONLOG_KEY_PASSWORD')
        }`);
gradle=gradle.replace(target,'release {\n            signingConfig signingConfigs.ironlogRelease');
fs.writeFileSync(path,gradle);
console.log('Release signing configured from environment variables.');
