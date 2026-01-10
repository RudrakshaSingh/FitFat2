import { useStepStore } from '../../store/step-store';

// Start step tracking service
export async function startStepTracking() {
  const { startTracking } = useStepStore.getState();
  startTracking();
}

// Stop step tracking service
export async function stopStepTracking() {
  const { stopTracking } = useStepStore.getState();
  stopTracking();
}

// Reset step count
export async function resetStepTracking() {
  const { resetSteps, stopTracking } = useStepStore.getState();
  stopTracking();
  resetSteps();
}
