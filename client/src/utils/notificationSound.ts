import notificationAudioUrl from '../assets/notification.mp3';

let audioInstance: HTMLAudioElement | null = null;

/**
 * Plays the notification sound effect (client/src/assets/notification.mp3)
 */
export const playNotificationSound = () => {
  try {
    if (!audioInstance) {
      audioInstance = new Audio(notificationAudioUrl);
    }
    audioInstance.currentTime = 0;
    audioInstance.play().catch((err) => {
      console.warn('Audio auto-play prevented by browser policy (user interaction required first):', err);
    });
  } catch (err) {
    console.error('Failed to play notification sound:', err);
  }
};

/**
 * Requests browser notification permissions if not already requested
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.warn('Notification permission request failed:', e);
    }
  }
};

/**
 * Triggers sound effect + Chrome/Browser native push notification
 */
export const triggerNotification = async (title: string, body?: string) => {
  // Always play notification sound effect
  playNotificationSound();

  // Send Chrome / Browser Notification if permitted
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body || 'QRasoi Live Alert',
          icon: '/logo.png',
          badge: '/logo.png',
        });
      } catch (e) {
        console.warn('Browser Notification creation error:', e);
      }
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        try {
          new Notification(title, {
            body: body || 'QRasoi Live Alert',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        } catch (e) {
          console.warn('Browser Notification creation error:', e);
        }
      }
    }
  }
};
