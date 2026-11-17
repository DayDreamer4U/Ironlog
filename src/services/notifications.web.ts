export async function scheduleRest(_seconds: number, _label: string): Promise<string> { throw new Error('Browser preview: background rest notifications are available in the Android build.'); }
export async function cancelRest(_id: string | null) {}
export async function cancelAllRest() {}
export async function enablePreciseAlerts() { throw new Error('Precise alarm permission is available in the Android app.'); }
