import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { useWorkoutStore, WorkoutSet } from "store/workout-store";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ExerciseSelectionModal from "@/app/components/ExerciseSelectionModal";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { useUser } from "@clerk/clerk-expo";


// Query to find exercise by name Execute Query
const findExerciseQuery =
  defineQuery(`* [_type == "exercise" && name == $name][0] {
_id,
name
}`);

export default function ActiveWorkout() {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [showExerciseSelection, setShowExerciseSelection] = useState(false);
  const {
    workoutExercises,
    setWorkoutExercises,
    resetWorkout,
    weightUnit,
    setWeightUnit,
  } = useWorkoutStore();

  const router = useRouter();

  // Use the stopwatch hook for timing
  const { seconds, minutes, hours, totalSeconds, reset } = useStopwatch({
    autoStart: true,
  });

  // Reset timer when screen is focused and no active workout (fresh start)
  useFocusEffect(
    React.useCallback(() => {
      // Only reset if we have no exercises indicating a fresh start after ending workout
      if (workoutExercises.length === 0) {
        reset();
      }

      return () => {}; // cleanup is required
    }, [workoutExercises.length, reset])
  );

  useFocusEffect(
    React.useCallback(() => {
      // When entering this screen
      StatusBar.setBarStyle("light-content");
      if (Platform.OS === "android") {
        StatusBar.setBackgroundColor("#1F2937");
      }

      return () => {
        // When leaving this screen → restore your default look
        StatusBar.setBarStyle("dark-content");
        if (Platform.OS === "android") {
          StatusBar.setBackgroundColor("#f9fafb");
        }
      };
    }, [])
  );

  // Format stopwatch time
  const getWorkoutDuration = () => {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const cancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel the workout?",
      [
        { text: "No", style: "cancel" },
        {
          text: "End Workout",
          style: "destructive",
          onPress: () => {
            resetWorkout();
            router.back();
          },
        },
      ]
    );
  };

  const addExercise = () => {
    setShowExerciseSelection(true);
  };

  const deleteExercise = (exerciseId: string) => {
    setWorkoutExercises((exercises) =>
      exercises.filter((exercise) => exercise.id !== exerciseId)
    );
  };
  const deleteSet = (exerciseId: string, setId: string) => {
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      )
    );
  };
  const saveWorkout = () => {
    // are you sure you want to complete the workout?
    Alert.alert(
      "Complete Workout",
      "Are you sure you want to complete the workout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Complete", onPress: async () => await endWorkout() },
      ]
    );
  };

  const endWorkout = async () => {
    const saved = await saveWorkoutToDatabase();

    if (saved) {
      Alert.alert("Workout Saved", "Your workout has been saved successfully!");
    }

    // Reset the workout
    resetWorkout();

    router.replace("/(app)/(tabs)/history?refresh=true");
  };

  const saveWorkoutToDatabase = async () => {
    // Check if already saving to prevent multiple attempts
    if (isSaving) return false;

    setIsSaving(true);

    try {
      // implement saving ...

      // Use stopwatch total seconds for duration
      const durationInSeconds = totalSeconds;

      // TODO: Add your API call here, for example:
      // await saveWorkout({ duration: durationInSeconds });
      // Transform exercises data to match Sanity schema
      const exercisesForSanity = await Promise.all(
        workoutExercises.map(async (exercise) => {
          // Find the exercise document in Sanity by name
          const exerciseDoc = await client.fetch(findExerciseQuery, {
            name: exercise.name,
          });

          if (!exerciseDoc) {
            throw new Error(
              `Exercise "${exercise.name}" not found in database`
            );
          }

          // Transform sets to match schema (only completed sets, convert to numbers)
          const setsForSanity = exercise.sets
            .filter((set) => set.isCompleted && set.reps && set.weight)
            .map((set) => ({
              _type: "set",
              _key: Math.random().toString(36).substr(2, 9),
              reps: parseInt(set.reps, 10) || 0,
              weight: parseFloat(set.weight) || 0,
              weightUnit: set.weightUnit,
            }));

          return {
            _type: "workoutExercise",
            _key: Math.random().toString(36).substr(2, 9),
            exerciseRef: {
              _type: "reference",
              _ref: exerciseDoc._id,
            },
            sets: setsForSanity,
          };
        })
      );

      // Filter out exercises with no completed sets
      const validExercises = exercisesForSanity.filter(
        (exercise) => exercise.sets.length > 0
      );

      if (validExercises.length === 0) {
        Alert.alert(
          "No Completed Sets",
          "Please complete at least one set before saving the workout."
        );
        return false;
      }

      // Create the workout document
      const workoutData = {
        _type: "workout",
        userId: user.id,
        date: new Date().toISOString(),
        duration: durationInSeconds,
        exercises: validExercises,
      };

      // Save the workout to Sanity
      const result = await fetch("/api/save-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workoutData }),
      });

      console.log("workout saved", result);
      return true;
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert("Save Failed", "Failed to save workout. Please try again.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const addNewSet = (exerciseId: string) => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(),
      reps: "",
      weight: "",
      weightUnit: weightUnit,
      isCompleted: false,
    };

    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId
                  ? { ...set, isCompleted: !set.isCompleted }
                  : set
              ),
            }
          : exercise
      )
    );
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    setWorkoutExercises((exercises) =>
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : exercise
      )
    );
  };

  return (
    <View className="flex-1">
      {/* Top Safe Area */}
      <View
        className="bg-gray-800"
        style={{
          paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
        }}
      />
      {/* Header */}
      <View className="bg-gray-800 px-6 py-4">
        <View className="flex-row items-center justify-between">
          {/* Left Section */}
          <View>
            <Text className="text-white text-xl font-semibold">
              Active Workout
            </Text>
            <Text className="text-gray-300">{getWorkoutDuration()}</Text>
          </View>

          {/* Right Section */}
          <View className="flex-row items-center gap-2">
            {/* Weight Unit Toggle */}
            <View className="flex-row bg-gray-700 rounded-lg p-1">
              {/* LBS Button */}
              <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "lbs" ? "bg-purple-600" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    weightUnit === "lbs" ? "text-white" : "text-gray-300"
                  }`}
                >
                  lbs
                </Text>
              </TouchableOpacity>

              {/* KG Button */}
              <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "kg" ? "bg-purple-600" : ""
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    weightUnit === "kg" ? "text-white" : "text-gray-300"
                  }`}
                >
                  kg
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={cancelWorkout}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">End Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Content Area with White Background */}
      <View className="flex-1 bg-white">
        {/* Workout Progress */}
        <View className="px-6 mt-4">
          <Text className="text-center text-gray-600 mb-2">
            {workoutExercises.length} exercises
          </Text>
        </View>

        {/* If no exercises, show a message */}
        {workoutExercises.length === 0 && (
          <View className="bg-gray-50 rounded-2xl p-8 items-center mx-6">
            <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />

            <Text className="text-gray-600 text-lg text-center mt-4 font-medium">
              No exercises yet
            </Text>

            <Text className="text-gray-500 text-center mt-2">
              Get started by adding your first exercise below
            </Text>
          </View>
        )}

        {/* All exercises -Vertical List */}
        <KeyboardAwareScrollView
          className="flex-1 "
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 60,
            marginTop: 16,
          }}
          enableOnAndroid={true}
          extraScrollHeight={150} // lifts inputs above keyboard
          extraHeight={150} // perfect for nested views
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
        >
          {workoutExercises.map((exercise) => (
            <View key={exercise.id} className="mb-8">
              {/* Exercise Header */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/exercise-detail",
                    params: { id: exercise.sanityId },
                  })
                }
                className="bg-purple-50 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row items-center justify-between">
                  {/* Left Section */}
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-2">
                      {exercise.name}
                    </Text>

                    <Text className="text-gray-600">
                      {exercise.sets.length} sets ·{" "}
                      {exercise.sets.filter((set) => set.isCompleted).length}{" "}
                      completed
                    </Text>
                  </View>

                  {/* Delete Exercise Button */}
                  <TouchableOpacity
                    onPress={() => deleteExercise(exercise.id)}
                    className="w-10 h-10 rounded-xl items-center justify-center bg-red-500 ml-3"
                  >
                    <Ionicons name="trash" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>

              {/* Exercise Sets */}
              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-3">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  Sets
                </Text>

                {/* No Sets */}
                {exercise.sets.length === 0 ? (
                  <Text className="text-gray-500 text-center py-4">
                    No sets yet. Add your first set below.
                  </Text>
                ) : (
                  exercise.sets.map((set, setIndex) => (
                    <View
                      key={set.id}
                      className={`py-3 px-3 mb-2 rounded-lg border ${
                        set.isCompleted
                          ? "bg-green-100 border-green-300"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* First Row: Set number, Reps, Weight, Complete button, Delete button */}
                      <View className="flex-row items-center justify-between">
                        <Text className=" [text-gray-700 font-medium w-8">
                          {setIndex + 1}
                        </Text>
                        {/* Reps input */}
                        <View className="flex-1 mx-2">
                          <Text className="text-xs text-gray-500 mb-1">
                            Reps
                          </Text>

                          <TextInput
                            value={set.reps}
                            onChangeText={(value) =>
                              updateSet(exercise.id, set.id, "reps", value)
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            editable={!set.isCompleted}
                            className={`border rounded-lg px-3 py-2 text-center ${
                              set.isCompleted
                                ? "bg-gray-100 border-gray-300 text-gray-500"
                                : "bg-white border-gray-300"
                            }`}
                          />
                        </View>

                        {/* Weight Input */}
                        <View className="flex-1 mx-2">
                          <Text className="text-xs text-gray-500 mb-1">
                            Weight ({weightUnit})
                          </Text>

                          <TextInput
                            value={set.weight}
                            onChangeText={(value) =>
                              updateSet(exercise.id, set.id, "weight", value)
                            }
                            placeholder="0"
                            keyboardType="numeric"
                            editable={!set.isCompleted}
                            className={`border rounded-lg px-3 py-2 text-center ${
                              set.isCompleted
                                ? "bg-gray-100 border-gray-300 text-gray-500"
                                : "bg-white border-gray-300"
                            }`}
                          />
                        </View>

                        {/* Complete Button */}
                        <TouchableOpacity
                          onPress={() =>
                            toggleSetCompletion(exercise.id, set.id)
                          }
                          className={`w-12 h-12 rounded-xl items-center justify-center mx-1 ${
                            set.isCompleted ? "bg-green-500" : "bg-gray-200"
                          }`}
                        >
                          <Ionicons
                            name={
                              set.isCompleted
                                ? "checkmark"
                                : "checkmark-outline"
                            }
                            size={20}
                            color={set.isCompleted ? "white" : "#9CA3AF"}
                          />
                        </TouchableOpacity>

                        {/* Delete Button */}
                        <TouchableOpacity
                          onPress={() => deleteSet(exercise.id, set.id)}
                          className="w-12 h-12 rounded-xl items-center justify-center ml-1 bg-red-600"
                        >
                          <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
                {/* Add New Set Button */}
                <TouchableOpacity
                  onPress={() => addNewSet(exercise.id)}
                  className="bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg py-3 items-center mt-2"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="add"
                      size={16}
                      color="#9333EA"
                      style={{ marginRight: 6 }}
                    />
                    <Text className="text-purple-600 font-medium">Add Set</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {/* Add Exercise Button */}
          <TouchableOpacity
            onPress={addExercise}
            className="bg-purple-600 rounded-2xl py-4 items-center mb-8"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="add"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text className="text-white font-semibold text-lg">
                Add Exercise
              </Text>
            </View>
          </TouchableOpacity>

          {/* Complete Workout Button */}
          <TouchableOpacity
            onPress={saveWorkout}
            disabled={
              isSaving ||
              workoutExercises.length === 0 ||
              workoutExercises.some((exercise) =>
                exercise.sets.some((set) => !set.isCompleted)
              )
            }
            className={`rounded-2xl py-4 items-center mb-8 ${
              isSaving ||
              workoutExercises.length === 0 ||
              workoutExercises.some((exercise) =>
                exercise.sets.some((set) => !set.isCompleted)
              )
                ? "bg-gray-400"
                : "bg-green-600 active:bg-green-700"
            }`}
          >
            {isSaving ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Saving ...
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">
                Complete Workout
              </Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>

      {/* Exercise Selection Modal */}
      <ExerciseSelectionModal
        visible={showExerciseSelection}
        onClose={() => setShowExerciseSelection(false)}
      />
    </View>
  );
}
