import { client } from "@/lib/sanity/client";
import { GetWorkoutsQueryResult } from "@/lib/sanity/type";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { formatDuration } from "lib/util";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import exercise from "sanity/schemaTypes/exercise";
import CustomAlert from "@/app/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const getWorkoutRecordQuery = defineQuery(`
  *[_type == "workout" && _id == $workoutId][0]{
    _id,
    _type,
    _createdAt,
    date,
    duration,
    exercises[] {
      exerciseRef-> {
        _id,
        name,
        description
      },
      sets[] {
        reps,
        weight,
        weightUnit,
        _type,
        _key
      },
      _type,
      _key
    }
  }
`);

export default function WorkoutRecord() {
  const { workoutId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const deleteAlert = useCustomAlert();

  // Get user's preferred weight unit from Clerk metadata
  const userWeightUnit = (user?.unsafeMetadata?.weightUnit as "kg" | "lbs") || "kg";

  // Convert weight to user's preferred unit
  const convertWeight = (weight: number, fromUnit: string): number => {
    if (fromUnit === userWeightUnit) return weight;
    if (fromUnit === "kg" && userWeightUnit === "lbs") return weight * 2.20462;
    if (fromUnit === "lbs" && userWeightUnit === "kg") return weight / 2.20462;
    return weight;
  };

  const [workout, setWorkout] = useState<GetWorkoutsQueryResult[number] | null>(
    null
  );

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return;

      try {
        const result = await client.fetch(getWorkoutRecordQuery, {
          workoutId,
        });

        setWorkout(result);
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  };

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets.length || 0);
      }, 0) || 0
    );
  };

  const getTotalVolume = () => {
    let totalVolume = 0;

    workout?.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight && set.reps) {
          const convertedWeight = convertWeight(set.weight, set.weightUnit || "kg");
          totalVolume += convertedWeight * set.reps;
        }
      });
    });
    return { volume: totalVolume, unit: userWeightUnit };
  };

  const handleDeleteWorkout = () => {
    deleteAlert.showAlert(
      "Delete Workout",
      "Are you sure you want to delete this workout? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteWorkout,
        },
      ]
    );
  };

  const deleteWorkout = async () => {
    if (!workoutId) return;

    setDeleting(true);

    try {
      await fetch("/api/delete-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workoutId }),
      });

      // Navigate back & refresh history page
      router.replace("/(app)/(tabs)/history?refresh=true");
    } catch (error) {
      console.error("Error deleting workout:", error);

      Alert.alert("Error", "Failed to delete workout. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 mt-4">Loading workout...</Text>
          <ActivityIndicator size="large" color="#9333EA" />
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />

          <Text className="text-xl font-semibold text-gray-900 mt-4">
            Workout Not Found
          </Text>

          <Text className="text-gray-600 text-center mt-2">
            This workout record could not be found.
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-purple-600 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { volume, unit } = getTotalVolume();

  return (
    <SafeAreaView className=" flex-1" edges={[]}>
      <ScrollView className="flex-1">
        {/* Workout Summary */}
        <View className="bg-white p-6 border-b border-gray-300">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Workout Summary
            </Text>

            <TouchableOpacity
              onPress={handleDeleteWorkout}
              disabled={deleting}
              className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text className="text-white font-medium ml-2">Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar-outline" size={20} color="#687280" />

            <Text className="text-gray-700 ml-3 font-medium">
              {formatDate(workout.date)} at {formatTime(workout.date)}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={20} color="#687280" />

            <Text className="text-gray-700 ml-3 font-medium">
              {formatWorkoutDuration(workout.duration)}
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="fitness-outline" size={20} color="#687280" />

            <Text className="text-gray-700 ml-3 font-medium">
              {workout.exercises?.length || 0} exercises
            </Text>
          </View>

          <View className="flex-row items-center mb-3">
            <Ionicons name="bar-chart-outline" size={20} color="#687280" />
            <Text className="text-gray-700 ml-3 font-medium">
              {getTotalSets(workout)} total sets
            </Text>
          </View>

          {volume > 0 && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="barbell-outline" size={20} color="#687280" />

              <Text className="text-gray-700 ml-3 font-medium">
                {volume.toLocaleString()} {unit} total volume
              </Text>
            </View>
          )}
        </View>

        {/* Exercise List */}
        <View className="space-y-4 p-6">
          {workout.exercises?.map((exerciseData, index) => (
            <View
              key={exerciseData._key}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              {/* Exercise Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {exerciseData.exerciseRef?.name || "Unknown Exercise"}
                  </Text>

                  <Text className="text-gray-600 text-sm mt-1">
                    {exerciseData.sets?.length || 0} sets completed
                  </Text>
                </View>

                <View className="bg-purple-100 rounded-full w-10 h-10 items-center justify-center">
                  <Text className="text-purple-600 font-bold text-lg">
                    {index + 1}
                  </Text>
                </View>
              </View>

              {/* Sets */}
              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Sets:
                </Text>

                {exerciseData.sets?.map((set, setIndex) => (
                  <View
                    key={set._key}
                    className="bg-gray-50 rounded-lg p-3 flex-row items-center justify-between"
                  >
                    {/* Left side */}
                    <View className="flex-row items-center">
                      <View className="bg-gray-200 rounded-full w-6 h-6 items-center justify-center mr-3">
                        <Text className="text-gray-700 text-xs font-medium">
                          {setIndex + 1}
                        </Text>
                      </View>

                      <Text className="text-gray-900 font-medium">
                        {set.reps} reps
                      </Text>
                    </View>

                    {/* Right side: weight info */}
                    {set.weight && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="barbell-outline"
                          size={16}
                          color="#687280"
                        />
                        <Text className="text-gray-700 ml-2 font-medium">
                          {convertWeight(set.weight, set.weightUnit || "kg").toFixed(1)} {userWeightUnit}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Exercise Volume Summary */}
              {exerciseData.sets && exerciseData.sets.length > 0 && (
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">
                      Exercise Volume:
                    </Text>

                    <Text className="text-sm font-medium text-gray-900">
                      {exerciseData.sets
                        .reduce((total, set) => {
                          const convertedWeight = convertWeight(set.weight || 0, set.weightUnit || "kg");
                          return total + convertedWeight * (set.reps || 0);
                        }, 0)
                        .toFixed(1)}{" "}
                      {userWeightUnit}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Custom Alert for Delete Workout */}
      <CustomAlert
        visible={deleteAlert.visible}
        title={deleteAlert.config.title}
        message={deleteAlert.config.message}
        buttons={deleteAlert.config.buttons}
        onClose={deleteAlert.hideAlert}
      />
    </SafeAreaView>
  );
}
