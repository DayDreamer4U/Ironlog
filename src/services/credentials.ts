import * as SecureStore from 'expo-secure-store';
const KEY='ironlog.ninjas.key';
export function readApiKey() { return SecureStore.getItemAsync(KEY); }
export async function saveApiKey(key:string) { if(key.trim()) await SecureStore.setItemAsync(KEY,key.trim()); else await SecureStore.deleteItemAsync(KEY); }
