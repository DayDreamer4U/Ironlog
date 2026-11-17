import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({handleNotification: async () => ({shouldPlaySound:true,shouldSetBadge:false,shouldShowBanner:true,shouldShowList:true})});
export async function scheduleRest(seconds: number, label: string) {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('rest', {name:'Rest timer',importance:Notifications.AndroidImportance.HIGH,sound:'default',vibrationPattern:[0,250,150,250]});
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Timer started. Enable notifications in Android settings for rest alerts.');
  return Notifications.scheduleNotificationAsync({content:{title:'Rest complete',body:label,sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:Math.max(1,seconds),channelId:'rest'}});
}
export async function cancelRest(id: string | null) { if(id) await Notifications.cancelScheduledNotificationAsync(id); }
export async function cancelAllRest() { await Notifications.cancelAllScheduledNotificationsAsync(); }
export async function enablePreciseAlerts() { return Notifications.requestExactAlarmPermissionsAsync(); }
