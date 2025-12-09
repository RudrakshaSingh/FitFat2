import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { client, urlFor } from "@/lib/sanity/client";

interface Exercise {
  _id: string;
  name: string;
  image?: any;
  difficulty?: string;
}

interface PlannedExercise {
  exerciseRef: string; // Just the ID for saving
  plannedSets: number;
  plannedReps: number;
  notes?: string;
  // For display
  exercise?: Exercise;
}

export default function EditDayWorkout() {
  const router = useRouter();
  const { user } = useUser();
  const { day } = useLocalSearchParams<{ day: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [isRestDay, setIsRestDay] = useState(false);
  const [exercises, setExercises] = useState<PlannedExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [programId, setProgramId] = useState<string | null>(null);
  const [allDays, setAllDays] = useState<any[]>([]);

  const dayTitle = day ? day.charAt(0).toUpperCase() + day.slice(1) : "Day";

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch user's exercises from library
      const userExercises = await client.fetch(
        `*[_type == "exercise" && userId == $userId] { _id, name, image, difficulty }`,
        { userId: user.id }
      );
      setAvailableExercises(userExercises);

      // Fetch existing program
      const response = await fetch("/api/get-weekly-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.program) {
        setProgramId(data.program._id);
        setAllDays(data.program.days || []);

        const dayPlan = data.program.days?.find((d: any) => d.dayOfWeek === day);
        if (dayPlan) {
          setWorkoutName(dayPlan.workoutName || "");
          setIsRestDay(dayPlan.isRestDay || false);
          
          // Map exercises with their data
          const mappedExercises = (dayPlan.exercises || []).map((ex: any) => ({
            exerciseRef: ex.exerciseRef?._id,
            plannedSets: ex.plannedSets || 3,
            plannedReps: ex.plannedReps || 10,
            notes: ex.notes || "",
            exercise: ex.exerciseRef,
          }));
          setExercises(mappedExercises);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user, day])
  );

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([
      ...exercises,
      {
        exerciseRef: exercise._id,
        plannedSets: 3,
        plannedReps: 10,
        notes: "",
        exercise,
      },
    ]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const handleUpdateExercise = (
    index: number,
    field: "plannedSets" | "plannedReps" | "notes",
    value: any
  ) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Build the day plan
      const updatedDayPlan = {
        dayOfWeek: day,
        isRestDay,
        workoutName: workoutName || undefined,
        exercises: exercises.map((ex) => ({
          _type: "plannedExercise",
          exerciseRef: { _type: "reference", _ref: ex.exerciseRef },
          plannedSets: ex.plannedSets,
          plannedReps: ex.plannedReps,
          notes: ex.notes || undefined,
        })),
      };

      // Update or create the days array
      let updatedDays = [...allDays];
      const existingIndex = updatedDays.findIndex((d) => d.dayOfWeek === day);
      
      if (existingIndex >= 0) {
        updatedDays[existingIndex] = updatedDayPlan;
      } else {
        updatedDays.push(updatedDayPlan);
      }

      // Save to API
      const response = await fetch("/api/save-weekly-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          program: {
            name: "My Weekly Program",
            days: updatedDays,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Saved!", "Your workout plan has been updated.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ec4899" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">
          Edit {dayTitle}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="bg-pink-500 px-4 py-2 rounded-full"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Workout Name */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Workout Name</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="e.g., Push Day, Leg Day"
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Rest Day Toggle */}
        <View className="mb-6 flex-row items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="sleep" size={24} color="#3b82f6" />
            <Text className="text-gray-800 font-semibold ml-3">Rest Day</Text>
          </View>
          <Switch
            value={isRestDay}
            onValueChange={setIsRestDay}
            trackColor={{ false: "#d1d5db", true: "#93c5fd" }}
            thumbColor={isRestDay ? "#3b82f6" : "#f4f3f4"}
          />
        </View>

        {/* Exercises Section */}
        {!isRestDay && (
          <>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Exercises</Text>
              <TouchableOpacity
                onPress={() => setShowExercisePicker(true)}
                className="bg-pink-100 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="add" size={18} color="#ec4899" />
                <Text className="text-pink-600 font-semibold ml-1">Add</Text>
              </TouchableOpacity>
            </View>

            {/* Exercise List */}
            {exercises.length === 0 ? (
              <View className="bg-gray-100 rounded-2xl p-8 items-center">
                <Ionicons name="barbell-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-3 text-center">
                  No exercises added yet.{"\n"}Tap "Add" to get started!
                </Text>
              </View>
            ) : (
              exercises.map((ex, index) => (
                <View
                  key={index}
                  className="bg-white rounded-2xl p-4 mb-4 border border-gray-100"
                >
                  <View className="flex-row items-center mb-3">
                    {ex.exercise?.image ? (
                      <Image
                        source={{ uri: urlFor(ex.exercise.image).width(100).url() }}
                        className="w-12 h-12 rounded-lg"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center">
                        <Ionicons name="barbell" size={20} color="#9ca3af" />
                      </View>
                    )}
                    <Text className="flex-1 ml-3 font-bold text-gray-800">
                      {ex.exercise?.name || "Exercise"}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">Sets</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center"
                        keyboardType="number-pad"
                        value={String(ex.plannedSets)}
                        onChangeText={(v) =>
                          handleUpdateExercise(index, "plannedSets", parseInt(v) || 0)
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">Reps</Text>
                      <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center"
                        keyboardType="number-pad"
                        value={String(ex.plannedReps)}
                        onChangeText={(v) =>
                          handleUpdateExercise(index, "plannedReps", parseInt(v) || 0)
                        }
                      />
                    </View>
                  </View>
                </View>
              ))
            )}

            <View className="h-20" />
          </>
        )}
      </ScrollView>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-lg font-bold">Select Exercise</Text>
              <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {availableExercises.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-gray-500 text-center">
                  No exercises in your library.{"\n"}Add some from the Exercise tab first!
                </Text>
              </View>
            ) : (
              <ScrollView className="p-4">
                {availableExercises.map((ex) => (
                  <TouchableOpacity
                    key={ex._id}
                    onPress={() => handleAddExercise(ex)}
                    className="flex-row items-center p-3 bg-gray-50 rounded-xl mb-2"
                  >
                    {ex.image ? (
                      <Image
                        source={{ uri: urlFor(ex.image).width(100).url() }}
                        className="w-12 h-12 rounded-lg"
                      />
                    ) : (
                      <View className="w-12 h-12 rounded-lg bg-gray-200 items-center justify-center">
                        <Ionicons name="barbell" size={20} color="#9ca3af" />
                      </View>
                    )}
                    <Text className="flex-1 ml-3 font-semibold text-gray-800">
                      {ex.name}
                    </Text>
                    <Ionicons name="add-circle" size={24} color="#ec4899" />
                  </TouchableOpacity>
                ))}
                <View className="h-8" />
              </ScrollView>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
