import * as Picker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import * as Images from 'expo-image-picker';

export async function exportText(name: string, text: string, mime='application/json') {
  const file = new File(Paths.cache,name);
  file.write(text);
  if(!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device.');
  await Sharing.shareAsync(file.uri,{mimeType:mime,dialogTitle:'Save your Ironlog backup'});
}
export async function importText() {
  const result=await Picker.getDocumentAsync({type:['application/json','text/*','application/octet-stream'],copyToCacheDirectory:true});
  if(result.canceled) return null;
  if((result.assets[0].size ?? 0)>50_000_000) throw new Error('File exceeds 50 MB.');
  return new File(result.assets[0].uri).text();
}
export async function pickPhoto() {
  const result=await Images.launchImageLibraryAsync({mediaTypes:['images'],quality:0.7,allowsEditing:true});
  if(result.canceled) return undefined;
  const source = new File(result.assets[0].uri);
  const destination=new File(Paths.document,`exercise-${Date.now()}.jpg`);
  source.copy(destination);
  return destination.uri;
}
export async function portablePhoto(uri:string) { if(uri.startsWith('data:image/'))return uri;return `data:image/jpeg;base64,${await new File(uri).base64()}`; }
