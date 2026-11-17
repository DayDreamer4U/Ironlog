let key = '';
export async function readApiKey() { return key; }
export async function saveApiKey(value: string) { key=value; }
