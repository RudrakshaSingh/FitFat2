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
          <View className="w-full h-[420px] bg-gray-900 justify-center items-center">
            {exercise.gifUrl ? (
              <Image
                source={{ uri: exercise.gifUrl }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
                <View className="items-center justify-center opacity-50">
                     <Ionicons name="barbell-outline" size={100} color="white" />
                     <Text className="text-white mt-4 font-semibold">No Image Available</Text>
                </View>
            )}
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
            {/* Title Section - MATCHED TO IMAGE */}
            <View className="mb-8 items-center">
              <Text className="text-2xl font-extrabold text-gray-900 capitalize text-center leading-normal">
                {exercise.name.replace(/-/g, " ")}
              </Text>
              
              <Text className="text-gray-500 font-medium capitalize mt-1">
                 • {exercise.bodyPart}
              </Text>
            </View>

            {/* Stats Row - MATCHED TO IMAGE */}
            <View className="flex-row justify-between mb-8">
              {/* Equipment */}
              <View className="flex-1 items-center bg-white mx-1 py-4 rounded-3xl shadow-sm border border-gray-50">
                <View className="w-14 h-14 bg-purple-100 rounded-full items-center justify-center mb-2">
                  <MaterialCommunityIcons name="dumbbell" size={24} color="#9333EA" />
                </View>
                <Text className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Equipment</Text>
                <Text className="text-sm font-bold text-gray-900 capitalize mt-0.5">
                  {exercise.equipment || "None"}
                </Text>
              </View>

              {/* Difficulty */}
              <View className="flex-1 items-center bg-white mx-1 py-4 rounded-3xl shadow-sm border border-gray-50">
                <View className="w-14 h-14 bg-emerald-100 rounded-full items-center justify-center mb-2">
                  <Ionicons name="leaf" size={24} color="#10b981" />
                </View>
                <Text className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Difficulty</Text>
                <Text className="text-sm font-bold text-gray-900 text-center mt-0.5">
                  {exercise.difficulty || "Beginner"}
                </Text>
              </View>

              {/* Category */}
              <View className="flex-1 items-center bg-white mx-1 py-4 rounded-3xl shadow-sm border border-gray-50">
                <View className="w-14 h-14 bg-orange-100 rounded-full items-center justify-center mb-2">
                  <Feather name="zap" size={24} color="#f97316" />
                </View>
                <Text className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Category</Text>
                <Text className="text-sm font-bold text-gray-900 capitalize mt-0.5">
                  {exercise.category || "Strength"}
                </Text>
              </View>
            </View>

            {/* About Section - MATCHED TO IMAGE */}
            {exercise.description && (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-purple-600 font-bold text-sm">i</Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-900">About</Text>
                </View>
                 <Text className="text-gray-600 leading-6 text-base">
                    {exercise.description}
                  </Text>
              </View>
            )}

            {/* Muscles Worked */}
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                  <MaterialCommunityIcons name="arm-flex" size={22} color="#9333EA" />
                </View>
                <Text className="text-xl font-bold text-gray-900">Muscles Worked</Text>
              </View>

              {/* Primary */}
              <View className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-5 mb-3 border border-purple-100">
                <Text className="text-xs text-purple-400 uppercase tracking-wider font-bold mb-1">Primary Target</Text>
                <Text className="text-2xl font-extrabold text-purple-600 capitalize">
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

            {/* Video section */}
            {exercise.videoUrl && (
              <View className="mb-8">
                <Text className="text-lg font-bold text-gray-900 mb-3">
                  Video Tutorial
                </Text>

                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center shadow-sm"
                    // @ts-ignore
                  onPress={() => {
                        let url = exercise.videoUrl;
                        if (url && !/^https?:\/\//i.test(url)) {
                            url = 'https://' + url;
                        }
                        import('react-native').then(({ Linking }) => {
                            Linking.openURL(url);
                        });
                  }}
                  activeOpacity={0.7}
                >
                  <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-4">
                    <Ionicons name="play" size={24} color="#EF4444" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base">
                      Watch Demo
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Open video link
                    </Text>
                  </View>
                  
                  <Ionicons name="open-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            )}

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
            backgroundColor: saved ? '#10b981' : saving ? '#9ca3af' : '#9333EA',
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
              <View className="bg-white rounded-full p-0.5 mr-2">
                <Ionicons name="add" size={20} color="#9333EA" />
              </View>
              <Text className="text-white text-lg font-bold">Add to My Library</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
