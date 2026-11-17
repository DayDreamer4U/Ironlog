import { defineConfig } from 'vitest/config';
import {fileURLToPath} from 'node:url';
const local=(path:string)=>fileURLToPath(new URL(path,import.meta.url));
export default defineConfig({test:{include:['tests/**/*.test.{ts,tsx}'],environment:'node'},resolve:{alias:[
  {find:/^react-native$/,replacement:'react-native-web'},
  {find:/^\.\/files$|^.*\/services\/files$/,replacement:local('./src/services/files.web.ts')},
  {find:/^.*\/services\/credentials$/,replacement:local('./src/services/credentials.web.ts')},
  {find:/^.*\/services\/notifications$/,replacement:local('./src/services/notifications.web.ts')},
]}});
