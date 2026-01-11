import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const userName = user?.unsafeMetadata?.name as string | undefined;
  const displayName = userName || user?.firstName || "Friend";

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header with Greeting */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-gray-500 text-base font-medium">
            {getGreeting()} 👋
          </Text>
          <Text className="text-3xl font-bold text-gray-900 mt-1">
            {displayName}
          </Text>
        </View>

        {/* Today's Focus Card */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/workout")}
            activeOpacity={0.9}
            className="rounded-3xl overflow-hidden"
            style={{
              backgroundColor: '#9333EA',
              shadowColor: '#9333EA',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="bg-white/20 px-3 py-1.5 rounded-full">
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    Today's Focus
                  </Text>
                </View>
                <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              </View>
              
              <Text className="text-white/80 text-sm mb-1">Ready to crush it?</Text>
              <Text className="text-white text-2xl font-bold mb-2">
                Start Your Workout
              </Text>
              
              <View className="flex-row items-center mt-2">
                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full mr-2">
                  <Ionicons name="flash" size={14} color="white" />
                  <Text className="text-white text-xs ml-1 font-medium">Quick Start</Text>
                </View>
                <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-full">
                  <Ionicons name="calendar" size={14} color="white" />
                  <Text className="text-white text-xs ml-1 font-medium">Follow Plan</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/steps")}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100"
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-emerald-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Ionicons name="footsteps" size={24} color="#10b981" />
              </View>
              <Text className="text-gray-900 font-semibold text-sm">Steps</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Track today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/history")}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100"
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-blue-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Ionicons name="time-outline" size={24} color="#3b82f6" />
              </View>
              <Text className="text-gray-900 font-semibold text-sm">History</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Past workouts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(app)/(tabs)/exercise")}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-100"
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="bg-orange-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <MaterialCommunityIcons name="dumbbell" size={24} color="#f97316" />
              </View>
              <Text className="text-gray-900 font-semibold text-sm">Exercises</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Browse all</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature Cards */}
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Your Tools
          </Text>

          {/* User Library Card */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/user-library")}
            className="bg-white rounded-2xl p-5 mb-4 border border-gray-100"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-purple-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="library" size={28} color="#9333ea" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-0.5">
                  My Library
                </Text>
                <Text className="text-gray-500 text-sm">
                  Custom exercises & saved workouts
                </Text>
              </View>
              <View className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Profile Card */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/(tabs)/profile")}
            className="bg-white rounded-2xl p-5 border border-gray-100"
            activeOpacity={0.8}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <View className="bg-indigo-100 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="person" size={28} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 mb-0.5">
                  Profile & Settings
                </Text>
                <Text className="text-gray-500 text-sm">
                  Manage your account & preferences
                </Text>
              </View>
              <View className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center">
                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
