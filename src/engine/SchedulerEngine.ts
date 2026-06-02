import { useRotationStore } from '../store/rotationStore';
import { RotationEngine } from './RotationEngine';

export class SchedulerEngine {
  private static timerId: NodeJS.Timeout | null = null;

  static startScheduler() {
    if (this.timerId) return;

    this.timerId = setInterval(async () => {
      const rotationStore = useRotationStore.getState();
      const { settings, timeLeft } = rotationStore;

      if (!settings.rotation_enabled) {
        this.stopScheduler();
        return;
      }

      if (timeLeft <= 1) {
        // Trigger Rotation
        await RotationEngine.rotate();
      } else {
        rotationStore.decrementTimeLeft();
      }
    }, 1000);
  }

  static stopScheduler() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  static restartScheduler() {
    this.stopScheduler();
    this.startScheduler();
  }
}
