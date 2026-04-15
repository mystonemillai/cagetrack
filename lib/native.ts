export const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

export async function hapticTap() {
  if (!isNative) return;
  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.Haptics) {
      await w.Capacitor.Plugins.Haptics.impact({ style: 'Light' });
    }
  } catch (e) {}
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.Haptics) {
      await w.Capacitor.Plugins.Haptics.notification({ type: 'Success' });
    }
  } catch (e) {}
}

export async function initStatusBar() {
  if (!isNative) return;
  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.StatusBar) {
      await w.Capacitor.Plugins.StatusBar.setStyle({ style: 'DARK' });
    }
  } catch (e) {}
}

export async function nativeShare(title: string, text: string, url: string) {
  if (!isNative) {
    try { await navigator.clipboard.writeText(url); return { shared: false, copied: true }; } catch (e) { return { shared: false, copied: false }; }
  }
  try {
    const w = window as any;
    if (w.Capacitor?.Plugins?.Share) {
      await w.Capacitor.Plugins.Share.share({ title, text, url });
      return { shared: true, copied: false };
    }
    return { shared: false, copied: false };
  } catch (e) { return { shared: false, copied: false }; }
}

export async function initPushNotifications(onTokenReceived: (token: string) => void) {
  if (!isNative) return;
  try {
    const w = window as any;
    const push = w.Capacitor?.Plugins?.PushNotifications;
    if (!push) return;
    const permResult = await push.requestPermissions();
    if (permResult.receive !== 'granted') return;
    await push.register();
    push.addListener('registration', (token: any) => { onTokenReceived(token.value); });
    push.addListener('pushNotificationActionPerformed', () => { window.location.href = '/dashboard'; });
  } catch (e) {}
}
