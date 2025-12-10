import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const userName = user?.unsafeMetadata?.name as string | undefined;
  const displayName = userName || user?.firstName || "Friend";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-gray-500 text-lg font-medium mb-1">
            Welcome back,
          </Text>
          <Text className="text-3xl font-bold text-gray-800">
            {displayName}
          </Text>
        </View>

        {/* User Library Card */}
        <TouchableOpacity
          onPress={() => router.push("/(app)/user-library")}
          className="bg-white rounded-2xl p-6 shadow-sm flex-row items-center border border-purple-100 mb-6"
          activeOpacity={0.8}
        >
          <View className="bg-purple-100 p-4 rounded-full mr-5">
            <Ionicons name="library" size={28} color="#9333ea" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800 mb-1">
              User Library
            </Text>
            <Text className="text-gray-500 text-sm leading-5">
              Access your custom exercises, saved workouts, and routines.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        {/* Quick Actions / Future Content */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-4">
               <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/workout")}
                className="flex-1 bg-purple-600 rounded-2xl p-4 shadow-sm items-center justify-center aspect-square"
                activeOpacity={0.8}
              >
                <Ionicons name="barbell" size={32} color="white" />
                <Text className="text-white font-bold mt-2">Workout</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/history")}
                className="flex-1 bg-white rounded-2xl p-4 shadow-sm items-center justify-center aspect-square border border-gray-100"
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={32} color="#9333ea" />
                <Text className="text-gray-800 font-bold mt-2">History</Text>
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
