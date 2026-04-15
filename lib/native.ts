export const isNative = typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.();

export async function hapticTap() {
  if (!isNative) return;
  try {
    const mod = await import('@capacitor/haptics');
    await mod.Haptics.impact({ style: mod.ImpactStyle.Light });
  } catch (e) {}
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    const mod = await import('@capacitor/haptics');
    await mod.Haptics.notification({ type: mod.NotificationType.Success });
  } catch (e) {}
}

export async function initStatusBar() {
  if (!isNative) return;
  try {
    const mod = await import('@capacitor/status-bar');
    await mod.StatusBar.setStyle({ style: mod.Style.Dark });
  } catch (e) {}
}

export async function nativeShare(title: string, text: string, url: string) {
  if (!isNative) {
    try { await navigator.clipboard.writeText(url); return { shared: false, copied: true }; } catch (e) { return { shared: false, copied: false }; }
  }
  try {
    const mod = await import('@capacitor/share');
    await mod.Share.share({ title, text, url });
    return { shared: true, copied: false };
  } catch (e) { return { shared: false, copied: false }; }
}

export async function initPushNotifications(onTokenReceived: (token: string) => void) {
  if (!isNative) return;
  try {
    const mod = await import('@capacitor/push-notifications');
    const permResult = await mod.PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;
    await mod.PushNotifications.register();
    mod.PushNotifications.addListener('registration', (token) => { onTokenReceived(token.value); });
    mod.PushNotifications.addListener('pushNotificationActionPerformed', () => { window.location.href = '/dashboard'; });
  } catch (e) {}
}
