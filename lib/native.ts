// Check if running as native app
export const isNative = Capacitor.isNativePlatform();

// Haptic feedback
export async function hapticTap() {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (e) {}
}

export async function hapticSuccess() {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {}
}

export async function hapticError() {
  if (!isNative) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType.Error });
  } catch (e) {}
}

// Status bar
export async function initStatusBar() {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1C2B35' });
  } catch (e) {}
}

// Native share
export async function nativeShare(title: string, text: string, url: string) {
  if (!isNative) {
    // Fallback to clipboard for web
    try {
      await navigator.clipboard.writeText(url);
      return { shared: false, copied: true };
    } catch (e) {
      return { shared: false, copied: false };
    }
  }
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, url, dialogTitle: title });
    return { shared: true, copied: false };
  } catch (e) {
    return { shared: false, copied: false };
  }
}

// Push notifications
export async function initPushNotifications(onTokenReceived: (token: string) => void) {
  if (!isNative) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token) => {
      onTokenReceived(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      // User tapped the notification - navigate to dashboard
      window.location.href = '/dashboard';
    });
  } catch (e) {
    console.error('Push init error:', e);
  }
}
