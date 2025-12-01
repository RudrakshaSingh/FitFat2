import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WorkoutSet {
  id: string;
  reps: string;
  weight: string;
  weightUnit: "kg" | "lbs";
  isCompleted: boolean;
}

export interface WorkoutExercise {
  id: string;
  sanityId: string; // Store the Sanity _id reference
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutStore {
  // State
  workoutExercises: WorkoutExercise[];
  weightUnit: "kg" | "lbs";

  // Actions
  addExerciseToWorkout: (exercise: { name: string; sanityId: string }) => void;

  setWorkoutExercises: (
    exercises:
      | WorkoutExercise[]
      | ((prev: WorkoutExercise[]) => WorkoutExercise[])
  ) => void;

  setWeightUnit: (unit: "kg" | "lbs") => void;

  resetWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workoutExercises: [],
      weightUnit: "kg",

      addExerciseToWorkout: (exercise) =>
        set((state) => {
          const newExercise: WorkoutExercise = {
            id: Math.random().toString(),
            sanityId: exercise.sanityId,
            name: exercise.name,
            sets: [], // new exercise starts with no sets
          };

          return {
            workoutExercises: [...state.workoutExercises, newExercise],
          };
        }),

      setWorkoutExercises: (exercises) =>
        set((state) => ({
          workoutExercises:
            typeof exercises === "function"
              ? exercises(state.workoutExercises)
              : exercises,
        })),

      setWeightUnit: (unit) =>
        set({
          weightUnit: unit,
        }),

      resetWorkout: () =>
        set({
          workoutExercises: [],
        }),
    }),
    {
      name: "workout-store",
      storage: createJSONStorage(() => AsyncStorage),
      //select the partial state to persist
      partialize: (state) => ({
        weightUnit: state.weightUnit,
      }),
    }
  )
);
