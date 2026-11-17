import {describe,it,expect,vi,beforeEach} from 'vitest';
const native=vi.hoisted(()=>({
  setNotificationHandler:vi.fn(),setNotificationChannelAsync:vi.fn(),getPermissionsAsync:vi.fn(),requestPermissionsAsync:vi.fn(),scheduleNotificationAsync:vi.fn(),cancelScheduledNotificationAsync:vi.fn(),cancelAllScheduledNotificationsAsync:vi.fn(),requestExactAlarmPermissionsAsync:vi.fn(),AndroidImportance:{HIGH:4},SchedulableTriggerInputTypes:{TIME_INTERVAL:'timeInterval'}
}));
vi.mock('expo-notifications',()=>native);
vi.mock('react-native',()=>({Platform:{OS:'android'}}));
import {scheduleRest,cancelRest,cancelAllRest,enablePreciseAlerts} from '../src/services/notifications.ts';
beforeEach(()=>{vi.clearAllMocks();native.getPermissionsAsync.mockResolvedValue({granted:true});native.scheduleNotificationAsync.mockResolvedValue('notification-1');});
describe('native rest notifications',()=>{
 it('creates the channel before scheduling a local notification',async()=>{expect(await scheduleRest(90,'Bench press')).toBe('notification-1');expect(native.setNotificationChannelAsync).toHaveBeenCalledWith('rest',expect.anything());expect(native.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({trigger:{type:'timeInterval',seconds:90,channelId:'rest'}}));expect(native.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(native.getPermissionsAsync.mock.invocationCallOrder[0]);});
 it('reports denied notification permission without scheduling',async()=>{native.getPermissionsAsync.mockResolvedValue({granted:false});native.requestPermissionsAsync.mockResolvedValue({granted:false});await expect(scheduleRest(30,'Rest')).rejects.toThrow('Enable notifications');expect(native.scheduleNotificationAsync).not.toHaveBeenCalled();});
 it('cancels only the previous ID and supports bulk cancellation on restore',async()=>{await cancelRest(null);expect(native.cancelScheduledNotificationAsync).not.toHaveBeenCalled();await cancelRest('old');expect(native.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old');await cancelAllRest();expect(native.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();});
 it('opens the Android exact alarm permission flow on request',async()=>{native.requestExactAlarmPermissionsAsync.mockResolvedValue({granted:true});expect(await enablePreciseAlerts()).toEqual({granted:true});});
});
