// Reminder system that checks for tasks every 30 minutes during active hours
import { isInReminderTimeRange } from './taskParser';

export function startReminderSystem(onReminderTrigger) {
  let intervalId;
  let timeoutId;

  const checkReminders = async () => {
    // Only check during active hours (9:00 - 22:00)
    if (!isInReminderTimeRange()) {
      return;
    }

    try {
      const response = await fetch('/api/reminder-check');
      const reminderData = await response.json();
      
      if (reminderData.shouldShowReminder) {
        onReminderTrigger(reminderData);
      }
    } catch (error) {
      console.error('Failed to check reminders:', error);
    }
  };

  const scheduleNext30MinuteInterval = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Calculate milliseconds until next 30-minute mark (00 or 30)
    let minutesUntilNext;
    if (minutes < 30) {
      minutesUntilNext = 30 - minutes;
    } else {
      minutesUntilNext = 60 - minutes;
    }
    
    const millisecondsUntilNext = (minutesUntilNext * 60 - seconds) * 1000;
    
    // Schedule the next check
    timeoutId = setTimeout(() => {
      checkReminders();
      // Then start regular 30-minute intervals
      intervalId = setInterval(checkReminders, 30 * 60 * 1000);
    }, millisecondsUntilNext);
  };

  // Start the scheduling
  scheduleNext30MinuteInterval();

  // Also check immediately if we're in the right time range
  if (isInReminderTimeRange()) {
    checkReminders();
  }

  // Return cleanup function
  return () => {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
  };
}

export function isPhoneInHand() {
  // In a web environment, we can check if the page is visible and active
  // This simulates the Android PowerManager.isInteractive and KeyguardManager checks
  return document.visibilityState === 'visible' && document.hasFocus();
}

export function createReminderNotification(tasks) {
  // In a real mobile app, this would create a system notification
  // For web, we'll use the browser notification API if available
  if ('Notification' in window && Notification.permission === 'granted') {
    const timedTasks = tasks.filter(t => t.type === 'timed');
    const generalTasks = tasks.filter(t => t.type === 'general');
    
    let title = 'Task Reminder';
    let body = '';
    
    if (timedTasks.length > 0) {
      body += `Timed: ${timedTasks.map(t => t.description).join(', ')}`;
    }
    
    if (generalTasks.length > 0) {
      if (body) body += '\n';
      body += `General: ${generalTasks.map(t => t.description).join(', ')}`;
    }
    
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>'
    });
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
