import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { urlFor } from "@/lib/sanity/client";
import CustomAlert, { CustomAlertButton } from "@/app/components/CustomAlert";

interface PlannedSet {
  reps: number;
  weight?: number;
  weightUnit?: string;
}

interface PlannedExercise {
  sets?: PlannedSet[];
  // Old format support
  plannedSets?: number;
  plannedReps?: number;
  notes?: string;
  exerciseRef: {
    _id: string;
    name: string;
    description?: string;
    difficulty?: string;
    image?: any;
  };
}

interface DayPlan {
  dayOfWeek: string;
  isRestDay: boolean;
  workoutName?: string;
  exercises: PlannedExercise[];
}

interface WeeklyProgram {
  _id: string;
  name: string;
  days: DayPlan[];
}

const dayNames: { [key: string]: string } = {
  Mon: "monday",
  Tue: "tuesday",
  Wed: "wednesday",
  Thu: "thursday",
  Fri: "friday",
  Sat: "saturday",
  Sun: "sunday",
};

export default function DailyWorkout() {
  const router = useRouter();
  const { user } = useUser();
  const { day, date } = useLocalSearchParams<{ day: string; date: string }>();
  
  const [program, setProgram] = useState<WeeklyProgram | null>(null);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message?: string;
    buttons?: CustomAlertButton[];
  }>({ title: "" });

  const dayOfWeek = day ? dayNames[day] : null;
  const workoutDate = date ? new Date(date) : new Date();

  const fetchProgram = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch program via API
      const response = await fetch("/api/get-weekly-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      
      if (data.program) {
        setProgram(data.program);
        
        // Find the plan for this specific day
        const todayPlan = data.program.days?.find(
          (d: DayPlan) => d.dayOfWeek === dayOfWeek
        );
        setDayPlan(todayPlan || null);
      }
    } catch (error) {
      console.error("Error fetching program:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProgram();
    }, [user, dayOfWeek])
  );

  const handleStartWorkout = () => {
    if (!dayPlan || dayPlan.exercises.length === 0) {
      setAlertConfig({
        title: "No Exercises",
        message: "Add some exercises to this day first!",
      });
      setAlertVisible(true);
      return;
    }

    // Navigate to active workout with the planned exercises
    router.push({
      pathname: "/(app)/(tabs)/active-workout",
      params: {
        plannedExercises: JSON.stringify(dayPlan.exercises),
        workoutName: dayPlan.workoutName || `${day}'s Workout`,
      },
    });
  };

  const handleEditProgram = () => {
    router.push({
      pathname: "/(app)/edit-day-workout",
      params: {
        day: dayOfWeek,
        date: date,
      },
    });
  };

  const formatDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    return d.toLocaleDateString("en-US", options);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700";
      case "intermediate":
        return "bg-amber-100 text-amber-700";
      case "advanced":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333EA" />
          <Text className="text-gray-500 mt-3">Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 capitalize">
            {day}'s Workout
          </Text>
          <Text className="text-gray-500 text-sm">
            {formatDate(workoutDate)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleEditProgram}
          className="p-2 bg-gray-100 rounded-full"
        >
          <Ionicons name="pencil" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Rest Day */}
        {dayPlan?.isRestDay ? (
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
              <MaterialCommunityIcons name="sleep" size={48} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Rest Day</Text>
            <Text className="text-gray-500 text-center">
              Take it easy today! Recovery is just as important as training.
            </Text>
          </View>
        ) : dayPlan && dayPlan.exercises?.length > 0 ? (
          <View className="px-6 py-6">
            {/* Workout Name */}
            {dayPlan.workoutName && (
              <View className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6">
                <Text className="text-purple-600 font-bold text-lg">
                  {dayPlan.workoutName}
                </Text>
                <Text className="text-purple-400 text-sm mt-1">
                  {dayPlan.exercises.length} exercises planned
                </Text>
              </View>
            )}

            {/* Exercise List */}
            {dayPlan.exercises.map((exercise, index) => {
              // Handle both new sets array and old plannedSets/plannedReps format
              const setsArray = exercise.sets || [];
              const setCount = setsArray.length || exercise.plannedSets || 0;
              
              return (
                <View
                  key={index}
                  className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row mb-3">
                    {/* Exercise Image */}
                    {exercise.exerciseRef?.image ? (
                      <Image
                        source={{ uri: urlFor(exercise.exerciseRef.image).width(200).url() }}
                        className="w-16 h-16 rounded-xl bg-gray-200"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center">
                        <Ionicons name="barbell" size={24} color="#d1d5db" />
                      </View>
                    )}

                    {/* Exercise Info */}
                    <View className="flex-1 ml-3 justify-center">
                      <Text className="text-lg font-bold text-gray-900">
                        {exercise.exerciseRef?.name || "Unknown Exercise"}
                      </Text>
                      <Text className="text-gray-500 text-sm">
                        {setCount} sets planned
                      </Text>
                    </View>
                  </View>

                  {/* Individual Sets Display */}
                  {setsArray.length > 0 ? (
                    <View className="bg-gray-50 rounded-xl p-3">
                      {setsArray.map((set, setIndex) => (
                        <View
                          key={setIndex}
                          className="flex-row items-center py-2 border-b border-gray-200 last:border-b-0"
                        >
                          <Text className="text-gray-600 font-medium w-8">
                            {setIndex + 1}
                          </Text>
                          <View className="bg-purple-100 px-2 py-1 rounded-full mr-2">
                            <Text className="text-purple-700 font-semibold text-sm">
                              {set.reps} reps
                            </Text>
                          </View>
                          {set.weight ? (
                            <View className="bg-indigo-100 px-2 py-1 rounded-full mr-2">
                              <Text className="text-indigo-700 font-semibold text-sm">
                                {set.weight} {set.weightUnit || 'kg'}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ) : exercise.plannedSets && exercise.plannedReps ? (
                    // Old format fallback
                    <View className="flex-row items-center">
                      <View className="bg-purple-100 px-3 py-1 rounded-full mr-2">
                        <Text className="text-purple-700 font-semibold text-sm">
                          {exercise.plannedSets} sets
                        </Text>
                      </View>
                      <View className="bg-indigo-100 px-3 py-1 rounded-full">
                        <Text className="text-indigo-700 font-semibold text-sm">
                          {exercise.plannedReps} reps
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  {exercise.notes && (
                    <Text className="text-gray-400 text-sm mt-3 italic">
                      {exercise.notes}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          /* No Exercises Planned */
          <View className="flex-1 items-center justify-center py-20 px-6">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No Workout Planned</Text>
            <Text className="text-gray-500 text-center mb-6">
              You haven't planned any exercises for {day} yet.
            </Text>
            <TouchableOpacity
              onPress={handleEditProgram}
              className="bg-purple-600 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Plan Your Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {dayPlan && !dayPlan.isRestDay && dayPlan.exercises?.length > 0 && (
        <View className="px-6 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleStartWorkout}
            activeOpacity={0.9}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 py-5 rounded-2xl items-center flex-row justify-center shadow-lg"
            style={{ backgroundColor: "#9333EA" }}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Start Workout</Text>
          </TouchableOpacity>
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
