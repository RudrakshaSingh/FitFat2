import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StepStore {
  // State
  currentSteps: number;
  dailyGoal: number;
  lastResetDate: string; // ISO date string for tracking daily reset

  // Actions
  setCurrentSteps: (steps: number) => void;
  addSteps: (steps: number) => void;
  setDailyGoal: (goal: number) => void;
  resetSteps: () => void;
  checkAndResetForNewDay: () => void;
}

const getTodayDateString = () => new Date().toISOString().split("T")[0];

export const useStepStore = create<StepStore>()(
  persist(
    (set, get) => ({
      currentSteps: 0,
      dailyGoal: 10000, // Default goal of 10,000 steps
      lastResetDate: getTodayDateString(),

      setCurrentSteps: (steps) =>
        set({
          currentSteps: steps,
        }),

      addSteps: (steps) =>
        set((state) => ({
          currentSteps: state.currentSteps + steps,
        })),

      setDailyGoal: (goal) =>
        set({
          dailyGoal: goal,
        }),

      resetSteps: () =>
        set({
          currentSteps: 0,
          lastResetDate: getTodayDateString(),
        }),

      checkAndResetForNewDay: () => {
        const today = getTodayDateString();
        const { lastResetDate } = get();
        if (lastResetDate !== today) {
          set({
            currentSteps: 0,
            lastResetDate: today,
          });
        }
      },
    }),
    {
      name: "step-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dailyGoal: state.dailyGoal,
        currentSteps: state.currentSteps,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);
