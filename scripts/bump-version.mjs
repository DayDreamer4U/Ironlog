import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('app.json','utf8'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const parts=config.expo.version.split('.').map(Number);parts[2]++;
config.expo.version=parts.join('.');config.expo.android.versionCode++;
pkg.version=config.expo.version;
fs.writeFileSync('app.json',JSON.stringify(config,null,2)+'\n');fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));lock.version=pkg.version;if(lock.packages?.[''])lock.packages[''].version=pkg.version;fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\n');
console.log(`Version ${config.expo.version} / Android build ${config.expo.android.versionCode}`);
