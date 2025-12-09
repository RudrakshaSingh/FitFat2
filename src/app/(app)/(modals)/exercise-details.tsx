// app/(modals)/exercise-details.tsx
import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";

export default function ExerciseDetail() {
  const { user } = useUser();
  const router = useRouter();
  const { exercise: raw } = useLocalSearchParams<{ exercise?: string }>();
  const exercise = raw ? JSON.parse(raw) : null;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 items-center justify-center">
        <Ionicons name="barbell-outline" size={64} color="#6b7280" />
        <Text className="text-white text-xl font-bold mt-4">Exercise Not Found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-purple-600 px-8 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return { bg: "bg-emerald-500", text: "Beginner", icon: "leaf" };
      case "intermediate":
        return { bg: "bg-amber-500", text: "Intermediate", icon: "flame" };
      case "advanced":
        return { bg: "bg-rose-500", text: "Advanced", icon: "flash" };
      default:
        return { bg: "bg-gray-500", text: "Unknown", icon: "help" };
    }
  };

  const difficultyConfig = getDifficultyConfig(exercise.difficulty);

  const addToUserLibrary = async () => {
    if (saving || saved) return;
    setSaving(true);

    try {
      const result = await fetch("/api/add-execisie-to-library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exercise, userId: user?.id }),
      });

      const data = await result.json();

      if (result.ok) {
        setSaved(true);
        Alert.alert("Success! 🎉", "Exercise added to your library.");
      } else if (data.error === "duplicate") {
        setSaved(true); // Mark as saved since it already exists
        Alert.alert("Oops!", "This exercise already added.");
      } else {
        Alert.alert("Error", data.message || "Failed to save exercise. Try again.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        bounces={false}
        className="flex-1"
      >
        {/* Hero Section with GIF */}
        <View className="relative">
          {/* GIF Container */}
          <View className="w-full h-[420px] bg-gray-900">
            <Image
              source={{ uri: exercise.gifUrl }}
              className="w-full h-full"
              resizeMode="contain"
            />
            {/* Gradient Overlay */}
            <View className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
          </View>

          {/* Floating Header */}
          <SafeAreaView className="absolute top-0 left-0 right-0 z-20">
            <View className="flex-row justify-between items-center px-4 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-11 w-11 bg-black/50 backdrop-blur-xl rounded-full items-center justify-center"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Card */}
        <View className="bg-white -mt-10 rounded-t-[32px] min-h-screen">
          <View className="px-6 pt-8 pb-32">
            {/* Title Section */}
            <View className="mb-6">
              <Text className="text-3xl font-extrabold text-gray-900 capitalize leading-tight mb-2">
                {exercise.name.replace(/-/g, " ")}
              </Text>
              
              {/* Target Badge */}
              <View className="flex-row items-center">
                <View className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-1.5 rounded-full">
                  <Text className="text-white font-bold text-sm uppercase tracking-wide">
                    {exercise.target}
                  </Text>
                </View>
                <Text className="text-gray-400 mx-2">•</Text>
                <Text className="text-gray-500 font-medium capitalize">
                  {exercise.bodyPart}
                </Text>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row bg-gray-50 rounded-2xl p-4 mb-8">
              {/* Equipment */}
              <View className="flex-1 items-center border-r border-gray-200">
                <View className="w-12 h-12 bg-pink-100 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="dumbbell" size={24} color="#ec4899" />
                </View>
                <Text className="text-xs text-gray-400 uppercase tracking-wide">Equipment</Text>
                <Text className="text-sm font-bold text-gray-800 capitalize mt-1">
                  {exercise.equipment || "None"}
                </Text>
              </View>

              {/* Difficulty */}
              <View className="flex-1 items-center border-r border-gray-200">
                <View className={`w-12 h-12 ${difficultyConfig.bg} rounded-full items-center justify-center mb-2`}>
                  <Ionicons name={difficultyConfig.icon as any} size={24} color="white" />
                </View>
                <Text className="text-xs text-gray-400 uppercase tracking-wide">Difficulty</Text>
                <Text className="text-sm font-bold text-gray-800 mt-1">
                  {difficultyConfig.text}
                </Text>
              </View>

              {/* Category */}
              <View className="flex-1 items-center">
                <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
                  <Feather name="zap" size={24} color="#f97316" />
                </View>
                <Text className="text-xs text-gray-400 uppercase tracking-wide">Category</Text>
                <Text className="text-sm font-bold text-gray-800 capitalize mt-1">
                  {exercise.category || "General"}
                </Text>
              </View>
            </View>

            {/* About Section */}
            {exercise.description && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="information-circle" size={22} color="#6366f1" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900">About</Text>
                </View>
                <View className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                  <Text className="text-gray-600 leading-7 text-base">
                    {exercise.description}
                  </Text>
                </View>
              </View>
            )}

            {/* Muscles Worked */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-pink-100 rounded-xl items-center justify-center mr-3">
                  <MaterialCommunityIcons name="arm-flex" size={22} color="#ec4899" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Muscles Worked</Text>
              </View>

              {/* Primary */}
              <View className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 mb-3 border border-pink-100">
                <Text className="text-xs text-pink-400 uppercase tracking-wider font-bold mb-1">Primary Target</Text>
                <Text className="text-2xl font-extrabold text-pink-600 capitalize">
                  {exercise.target}
                </Text>
              </View>

              {/* Secondary */}
              {exercise.secondaryMuscles?.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {exercise.secondaryMuscles.map((m: string) => (
                    <View key={m} className="bg-gray-100 px-4 py-2.5 rounded-full">
                      <Text className="text-gray-700 font-semibold capitalize">{m}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Instructions */}
            {exercise.instructions?.length > 0 && (
              <View className="mb-8">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                    <Feather name="list" size={22} color="#10b981" />
                  </View>
                  <Text className="text-xl font-bold text-gray-900">How To Do It</Text>
                </View>

                <View className="bg-gray-50 rounded-2xl p-5">
                  {exercise.instructions.map((step: string, index: number) => (
                    <View 
                      key={index} 
                      className={`flex-row ${index !== exercise.instructions.length - 1 ? 'mb-5 pb-5 border-b border-gray-200' : ''}`}
                    >
                      <View className="w-9 h-9 bg-emerald-500 rounded-xl items-center justify-center mr-4 shadow-sm">
                        <Text className="text-white font-bold">{index + 1}</Text>
                      </View>
                      <Text className="flex-1 text-gray-700 text-base leading-7 pt-1">
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-4 pb-8">
        <TouchableOpacity
          onPress={addToUserLibrary}
          disabled={saving || saved}
          activeOpacity={0.9}
          className={`py-5 rounded-2xl items-center flex-row justify-center shadow-lg ${
            saved 
              ? "bg-emerald-500" 
              : saving 
              ? "bg-gray-400" 
              : "bg-gradient-to-r from-pink-500 to-rose-500"
          }`}
          style={{
            backgroundColor: saved ? '#10b981' : saving ? '#9ca3af' : '#ec4899',
          }}
        >
          {saving ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white text-lg font-bold ml-2">Saving...</Text>
            </>
          ) : saved ? (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">Added to Library!</Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">Add to My Library</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
