import { Pedometer } from 'expo-sensors';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { useStepStore } from '../../store/step-store';

const STEP_TRACKING_TASK = 'STEP_TRACKING_TASK';
const NOTIFICATION_ID = 'step-tracking-notification';

// Lazy load notifications module to avoid Expo Go errors
let Notifications: typeof import('expo-notifications') | null = null;
let TaskManager: typeof import('expo-task-manager') | null = null;
let BackgroundFetch: typeof import('expo-background-fetch') | null = null;
let notificationsAvailable = false;

// Initialize modules (call this once on app start)
async function initializeModules() {
  try {
    Notifications = await import('expo-notifications');
    TaskManager = await import('expo-task-manager');
    BackgroundFetch = await import('expo-background-fetch');
    
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
    
    notificationsAvailable = true;
    console.log('Notification modules initialized successfully');
  } catch (error) {
    console.log('Notifications not available (Expo Go):', error);
    notificationsAvailable = false;
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!notificationsAvailable || !Notifications) return false;
  
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
}

// Create a persistent notification for step tracking
export async function showTrackingNotification(stepCount: number) {
  if (!notificationsAvailable || !Notifications) return;
  
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_ID,
      content: {
        title: '🚶 Step Tracking Active',
        body: `${stepCount.toLocaleString()} steps today`,
        data: { type: 'step-tracking' },
        sticky: true,
        priority: Notifications.AndroidNotificationPriority.LOW,
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Error showing notification:', error);
  }
}

// Update the notification with new step count
export async function updateTrackingNotification(stepCount: number) {
  await showTrackingNotification(stepCount);
}

// Dismiss the tracking notification
export async function dismissTrackingNotification() {
  if (!notificationsAvailable || !Notifications) return;
  
  try {
    await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
  } catch (error) {
    console.log('Error dismissing notification:', error);
  }
}

// Register background task
export async function registerBackgroundTask() {
  if (!TaskManager || !BackgroundFetch) return;
  
  try {
    // Define task first
    TaskManager.defineTask(STEP_TRACKING_TASK, async () => {
      try {
        const { isTracking, addSteps, currentSteps } = useStepStore.getState();

        if (!isTracking) {
          return BackgroundFetch!.BackgroundFetchResult.NoData;
        }

        if (Platform.OS === 'ios') {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          try {
            const result = await Pedometer.getStepCountAsync(start, end);
            if (result && result.steps > currentSteps) {
              const newSteps = result.steps - currentSteps;
              addSteps(newSteps);
              await updateTrackingNotification(result.steps);
            }
          } catch (error) {
            console.log('Error fetching step count in background:', error);
          }
        }

        await updateTrackingNotification(currentSteps);
        return BackgroundFetch!.BackgroundFetchResult.NewData;
      } catch (error) {
        console.error('Background task error:', error);
        return BackgroundFetch!.BackgroundFetchResult.Failed;
      }
    });

    await BackgroundFetch.registerTaskAsync(STEP_TRACKING_TASK, {
      minimumInterval: 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background task registered');
  } catch (error) {
    console.log('Background task registration skipped:', error);
  }
}

// Unregister background task
export async function unregisterBackgroundTask() {
  if (!BackgroundFetch) return;
  
  try {
    await BackgroundFetch.unregisterTaskAsync(STEP_TRACKING_TASK);
    console.log('Background task unregistered');
  } catch (error) {
    console.log('Background task unregistration skipped:', error);
  }
}

// Start step tracking service
export async function startStepTracking() {
  // Initialize modules on first use
  if (!Notifications) {
    await initializeModules();
  }
  
  await requestNotificationPermissions();

  const { currentSteps, startTracking } = useStepStore.getState();
  
  startTracking();
  await showTrackingNotification(currentSteps);
  await registerBackgroundTask();
}

// Stop step tracking service
export async function stopStepTracking() {
  const { stopTracking } = useStepStore.getState();
  
  stopTracking();
  await dismissTrackingNotification();
  await unregisterBackgroundTask();
}

// App state change handler
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function setupAppStateHandler() {
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
    const { isTracking, currentSteps } = useStepStore.getState();

    if (isTracking) {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        await showTrackingNotification(currentSteps);
      }
    }
  });
}

export function cleanupAppStateHandler() {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}
