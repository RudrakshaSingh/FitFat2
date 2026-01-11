import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { StatusBar, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useWorkoutStore } from "store/workout-store";

// Map day index to day name
const dayIndexToName: { [key: number]: string } = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

const dayIndexToShort: { [key: number]: string } = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

interface DayPlan {
  dayOfWeek: string;
  isRestDay: boolean;
  workoutName?: string;
  exercises: any[];
}

export default function Workout() {
  const router = useRouter();
  const { user } = useUser();
  const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProgram, setHasProgram] = useState(false);
  
  const { setWorkoutExercises, resetWorkout } = useWorkoutStore();

  const today = new Date();
  const dayIndex = today.getDay();
  const todayName = dayIndexToName[dayIndex];
  const todayShort = dayIndexToShort[dayIndex];
  const todayDisplay = todayName.charAt(0).toUpperCase() + todayName.slice(1);

  const fetchTodayPlan = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/get-weekly-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();

      if (data.program) {
        setHasProgram(true);
        const plan = data.program.days?.find(
          (d: DayPlan) => d.dayOfWeek === todayName
        );
        setTodayPlan(plan || null);
      } else {
        setHasProgram(false);
        setTodayPlan(null);
      }
    } catch (error) {
      console.error("Error fetching today's plan:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTodayPlan();
    }, [user, todayName])
  );

  const startWorkout = () => {
    resetWorkout();
    router.push("/active-workout");
  };

  const handleTodayWorkout = () => {
    if (todayPlan && todayPlan.exercises && todayPlan.exercises.length > 0) {
      // Map exercises to ActiveWorkout format
      const mappedExercises = todayPlan.exercises.map((ex: any) => ({
        id: Math.random().toString(36).substring(7),
        sanityId: ex.exerciseRef._id,
        name: ex.exerciseRef.name,
        sets: (ex.sets || []).map((s: any) => ({
          id: Math.random().toString(36).substring(7),
          reps: s.reps?.toString() || "",
          weight: s.weight?.toString() || "",
          isCompleted: false,
        })),
        image: ex.exerciseRef.image,
      }));

      setWorkoutExercises(mappedExercises);

      router.push("/(app)/(tabs)/active-workout");
    } else {
      // Fallback
      router.push({
        pathname: "/(app)/daily-workout",
        params: {
          day: todayShort,
          date: today.toISOString(),
        },
      });
    }
  };

  const handlePlanToday = () => {
    // Navigate to edit-day-workout for today
    router.push({
      pathname: "/(app)/edit-day-workout",
      params: {
        day: todayName,
      },
    });
  };

  return (
    <SafeAreaView className=" flex-1 bg-gray-50">
      {/* Main Start Workout Screen */}
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="pt-4 pb-6 flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Ready to Train?
            </Text>

            <Text className="text-lg text-gray-600">
              Start your workout session
            </Text>
          </View>

          {/* History Button */}
          <TouchableOpacity
            onPress={() => router.push("/history")}
            className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={24} color="#9333EA" />
          </TouchableOpacity>
        </View>

        {/* Today's Workout Card */}
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 mb-5 overflow-hidden">
          {/* Card Header with gradient */}
          <View 
            className="px-5 py-4 flex-row items-center"
            style={{ backgroundColor: '#faf5ff' }}
          >
            <View className="w-11 h-11 bg-purple-600 rounded-xl items-center justify-center mr-3 shadow-sm">
              <Ionicons name="calendar" size={22} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {todayDisplay}
              </Text>
              <Text className="text-purple-600 text-sm font-medium">Today's Workout Plan</Text>
            </View>
            <TouchableOpacity 
              onPress={handlePlanToday}
              className="bg-white/80 p-2 rounded-xl"
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#9333EA" />
            </TouchableOpacity>
          </View>

          {/* Card Content */}
          <View className="p-5">
            {loading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#9333EA" />
                <Text className="text-gray-400 mt-2 text-sm">Loading...</Text>
              </View>
            ) : todayPlan?.isRestDay ? (
              // Rest Day - Premium styling
              <View className="bg-gradient-to-r rounded-2xl overflow-hidden" style={{ backgroundColor: '#eff6ff' }}>
                <View className="p-5 items-center">
                  <View className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center mb-3 shadow-lg" style={{ shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }}>
                    <Text className="text-2xl">😴</Text>
                  </View>
                  <Text className="text-blue-700 font-bold text-xl mb-1">
                    Rest Day
                  </Text>
                  <Text className="text-blue-500 text-center text-sm">
                    Take it easy! Recovery is just as important as training.
                  </Text>
                </View>
              </View>
            ) : todayPlan && todayPlan.exercises?.length > 0 ? (
              // Has workout planned
              <>
                <View className="mb-4">
                  <Text className="text-gray-900 font-bold text-2xl">
                    {todayPlan.workoutName || `${todayDisplay}'s Workout`}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="barbell-outline" size={16} color="#9333EA" />
                    <Text className="text-gray-600 ml-1 font-medium">
                      {todayPlan.exercises.length} exercises planned for today
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleTodayWorkout}
                  className="bg-purple-600 rounded-2xl py-4 items-center shadow-lg"
                  style={{ shadowColor: '#9333EA', shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="play"
                      size={20}
                      color="white"
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-white font-bold text-lg">
                      Start Today's Workout
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // No plan for today
              <TouchableOpacity
                onPress={handlePlanToday}
                className="bg-gray-50 rounded-2xl py-6 items-center border-2 border-dashed border-gray-200"
                activeOpacity={0.8}
              >
                <View className="bg-gray-200 w-12 h-12 rounded-full items-center justify-center mb-3">
                  <Ionicons name="add" size={24} color="#9ca3af" />
                </View>
                <Text className="text-gray-700 font-semibold text-lg">
                  Plan Your {todayDisplay}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Tap to add exercises
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stylized Divider */}
        <View className="flex-row items-center my-2 px-4 py-2">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <View className="mx-4">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">OR START FRESH</Text>
          </View>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>
      </View>

      {/* Generic Start Workout Card */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mx-6 mb-8">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="fitness" size={24} color="#9333EA" />
            </View>

            <View>
              <Text className="text-xl font-semibold text-gray-900">
                Custom Workout
              </Text>
              <Text className="text-gray-500">Start from scratch</Text>
            </View>
          </View>

          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-medium text-sm">Ready</Text>
          </View>
        </View>
        {/* Start Button */}
        <TouchableOpacity
          onPress={startWorkout}
          className="bg-white border-2 border-purple-600 rounded-2xl py-4 items-center"
          activeOpacity={0.6}
        >
          <View className="flex-row items-center">
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#9333EA"
              style={{ marginRight: 8 }}
            />
            <Text className="text-purple-600 font-bold text-lg">
              Start New Workout
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
