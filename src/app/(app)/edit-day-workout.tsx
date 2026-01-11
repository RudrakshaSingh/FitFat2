import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { client, urlFor } from "@/lib/sanity/client";
import CustomAlert, { CustomAlertButton } from "@/app/components/CustomAlert";

interface Exercise {
  _id: string;
  name: string;
  image?: any;
  difficulty?: string;
}

interface PlannedSet {
  id: string;
  reps: string;
  weight: string;
  weightUnit: "kg" | "lbs";
}

interface PlannedExercise {
  id: string;
  exerciseRef: string;
  sets: PlannedSet[];
  notes?: string;
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

  // Refs for input focus on validation errors
  const inputRefs = useRef<Map<string, TextInput | null>>(new Map());
  const scrollViewRef = useRef<ScrollView>(null);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: CustomAlertButton[];
  }>({ title: "" });

  const showAlert = (title: string, message?: string, buttons?: CustomAlertButton[]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  // Get weight unit from user's Clerk metadata (default to kg)
  const userWeightUnit = (user?.unsafeMetadata?.weightUnit as "kg" | "lbs") || "kg";

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

      // Fetch existing program via API
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

          // Map exercises with their data - handle both old and new format
          const mappedExercises = (dayPlan.exercises || []).map((ex: any) => {
            // Check if using new sets array format or old plannedSets/plannedReps format
            let sets: PlannedSet[] = [];
            
            if (ex.sets && Array.isArray(ex.sets)) {
              // New format - map sets array
              sets = ex.sets.map((s: any) => ({
                id: Math.random().toString(),
                reps: s.reps?.toString() || "",
                weight: s.weight?.toString() || "",
                weightUnit: s.weightUnit || userWeightUnit,
              }));
            } else if (ex.plannedSets && ex.plannedReps) {
              // Old format - convert to sets array
              for (let i = 0; i < ex.plannedSets; i++) {
                sets.push({
                  id: Math.random().toString(),
                  reps: ex.plannedReps?.toString() || "",
                  weight: "",
                  weightUnit: userWeightUnit,
                });
              }
            }

            return {
              id: Math.random().toString(),
              exerciseRef: ex.exerciseRef?._id,
              sets,
              notes: ex.notes || "",
              exercise: ex.exerciseRef,
            };
          });
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
        id: Math.random().toString(),
        exerciseRef: exercise._id,
        sets: [], // Start with no sets, user adds them one by one
        notes: "",
        exercise,
      },
    ]);
    setShowExercisePicker(false);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    const updated = exercises.filter((ex) => ex.id !== exerciseId);
    setExercises(updated);
  };

  const handleAddSet = (exerciseId: string) => {
    const newSetId = Math.random().toString();
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: newSetId,
                  reps: "",
                  weight: "",
                  weightUnit: userWeightUnit,
                },
              ],
            }
          : ex
      )
    );
    // Focus on the new reps input after state update
    setTimeout(() => {
      const refKey = `${exerciseId}-${newSetId}-reps`;
      inputRefs.current.get(refKey)?.focus();
    }, 100);
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.filter((s) => s.id !== setId),
            }
          : ex
      )
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    setExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Validate exercises with sets - collect first error for focus
      let firstErrorRef: string | null = null;
      
      for (const ex of exercises) {
        if (ex.sets.length === 0) {
          showAlert("No Sets", `Please add at least one set to ${ex.exercise?.name || "all exercises"}`);
          setSaving(false);
          return;
        }
        for (const set of ex.sets) {
          const repsNum = parseInt(set.reps);
          if (!set.reps || isNaN(repsNum) || repsNum <= 0) {
            if (!firstErrorRef) {
              firstErrorRef = `${ex.id}-${set.id}-reps`;
            }
          }
        }
      }
      
      // Focus on first error if any
      if (firstErrorRef) {
        const errorInput = inputRefs.current.get(firstErrorRef);
        if (errorInput) {
          errorInput.focus();
        }
        showAlert("Missing Reps", "Please fill in the reps for all sets.");
        setSaving(false);
        return;
      }

      const updatedDayPlan = {
        dayOfWeek: day,
        isRestDay,
        workoutName: workoutName || undefined,
        exercises: exercises.map((ex) => ({
          exerciseRef: ex.exerciseRef,
          sets: ex.sets.map((s) => ({
            reps: parseInt(s.reps, 10) || 1,
            weight: s.weight ? parseFloat(s.weight) : undefined,
            weightUnit: s.weightUnit,
          })),
          notes: ex.notes || undefined,
        })),
      };

      // Update or create the days array
      let updatedDays = [...allDays];
      const existingIndex = updatedDays.findIndex((d: any) => d.dayOfWeek === day);

      if (existingIndex >= 0) {
        updatedDays[existingIndex] = updatedDayPlan;
      } else {
        updatedDays.push(updatedDayPlan);
      }

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

      if (response.ok) {
        showAlert("Saved!", "Your workout plan has been updated.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to save");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      showAlert("Error", error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#9333EA" />
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
          className="bg-purple-600 px-4 py-2 rounded-full"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-6 pt-6" 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
                className="bg-purple-100 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name="add" size={18} color="#9333EA" />
                <Text className="text-purple-600 font-semibold ml-1">Add</Text>
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
              exercises.map((ex) => (
                <View
                  key={ex.id}
                  className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
                >
                  {/* Exercise Header */}
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
                    <TouchableOpacity onPress={() => handleRemoveExercise(ex.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>

                  {/* Sets Section */}
                  <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                      {ex.sets.length} Sets
                    </Text>

                    {/* Set List */}
                    {ex.sets.map((set, setIndex) => (
                      <View
                        key={set.id}
                        className="bg-white rounded-lg p-3 mb-2 border border-gray-200"
                      >
                        <View className="flex-row items-start">
                          {/* Set Number */}
                          <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-2 mt-6">
                            <Text className="text-gray-600 font-bold text-sm">
                              {setIndex + 1}
                            </Text>
                          </View>

                          {/* Reps Input */}
                          <View className="flex-1 mx-1">
                            <Text className="text-xs text-gray-500 mb-1 font-medium ml-1">Reps</Text>
                            <TextInput
                              ref={(ref) => {
                                inputRefs.current.set(`${ex.id}-${set.id}-reps`, ref);
                              }}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-gray-800 text-lg font-medium"
                              keyboardType="number-pad"
                              value={set.reps}
                              onChangeText={(v) =>
                                handleUpdateSet(ex.id, set.id, "reps", v)
                              }
                              placeholder="0"
                              placeholderTextColor="#d1d5db"
                            />
                          </View>

                          {/* Weight Input */}
                          <View className="flex-1 mx-1">
                            <Text className="text-xs text-gray-500 mb-1 font-medium ml-1">
                              Weight ({set.weightUnit})
                            </Text>
                            <TextInput
                              ref={(ref) => {
                                inputRefs.current.set(`${ex.id}-${set.id}-weight`, ref);
                              }}
                              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-gray-800 text-lg font-medium"
                              keyboardType="numeric"
                              value={set.weight}
                              onChangeText={(v) =>
                                handleUpdateSet(ex.id, set.id, "weight", v)
                              }
                              placeholder="-"
                              placeholderTextColor="#d1d5db"
                            />
                          </View>

                          {/* Delete Set Button */}
                          <TouchableOpacity
                            onPress={() => handleDeleteSet(ex.id, set.id)}
                            className="w-10 h-10 rounded-xl items-center justify-center ml-1 bg-red-50 mt-6 pt-0.5 border border-red-100"
                          >
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {/* Add Set Button */}
                    <TouchableOpacity
                      onPress={() => handleAddSet(ex.id)}
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

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}
