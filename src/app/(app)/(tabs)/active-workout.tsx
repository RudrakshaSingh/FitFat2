import {
  View,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import { useStopwatch } from "react-timer-hook";
import { useWorkoutStore } from "store/workout-store";
import { useFocusEffect, useRouter } from "expo-router";

export default function ActiveWorkout() {
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

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Top Safe Area */}
      <View
        className="bg-gray-800"
        style={{
          paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
        }}
      >
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
                    weightUnit === "lbs" ? "bg-blue-600" : ""
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
                    weightUnit === "kg" ? "bg-blue-600" : ""
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

        <Text className="text-white text-xl font-semibold px-4 py-3">
          Active Workout
        </Text>
      </View>
    </View>
  );
}
