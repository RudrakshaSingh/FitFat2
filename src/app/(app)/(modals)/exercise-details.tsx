// app/(modals)/exercise-details.tsx  (or wherever you have it)
import React from "react";
import { TouchableOpacity, Text, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "react-native-svg";

export default function ExerciseDetail() {
  const router = useRouter();
  const { exercise: raw } = useLocalSearchParams<{ exercise?: string }>();
  const exercise = raw ? JSON.parse(raw) : null;

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950 items-center justify-center">
        <Text className="text-white text-xl font-bold">Exercise Not Found</Text>
      </SafeAreaView>
    );
  }

  const difficultyColor =
    exercise.difficulty === "beginner"
      ? "bg-green-500"
      : exercise.difficulty === "intermediate"
      ? "bg-yellow-500"
      : "bg-red-500";

  const addToUserLibrary = () => {
    console.log("Added to library:", exercise.name);
    // Your logic here
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-6 z-20 h-11 w-11 bg-black/60 rounded-full items-center justify-center shadow-lg backdrop-blur-md"
        >
          <Ionicons name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        {/* Full-width GIF */}
        <View className="w-full h-96 bg-black">
          <Image
            source={{ uri: exercise.gifUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* White Card Content */}
        <View className="bg-white rounded-t-3xl -mt-8 px-6 pt-10 pb-16">
          {/* Exercise Name */}
          <Text className="text-4xl font-extrabold text-gray-900 capitalize leading-tight">
            {exercise.name.replace(/-/g, " ")}
          </Text>

          {/* Target + Body Part - Now clearly visible below */}
          <Text className="text-xl font-bold text-pink-600 mt-2 capitalize">
            {exercise.target} • {exercise.bodyPart}
          </Text>

          {/* Tags Row */}
          <View className="flex-row flex-wrap gap-3 mt-6 mb-8">
            <View className="flex-row items-center bg-pink-50 px-4 py-2.5 rounded-full">
              <MaterialCommunityIcons
                name="weight-lifter"
                size={18}
                color="#db2777"
              />
              <Text className="ml-2 font-semibold text-pink-700 capitalize">
                {exercise.equipment}
              </Text>
            </View>

            <View className={`px-4 py-2.5 rounded-full ${difficultyColor}`}>
              <Text className="text-white font-bold capitalize">
                {exercise.difficulty}
              </Text>
            </View>

            <View className="flex-row bg-gray-100 px-4 py-2.5 rounded-full items-center">
              <Feather name="zap" size={18} color="#fb923c" />
              <Text className="ml-2 font-semibold text-gray-700 capitalize pr-1">
                {exercise.category || "Unknown"}
              </Text>
            </View>
          </View>

          {/* Description */}
          {exercise.description && (
            <View className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-200">
              <View className="flex-row items-center mb-3">
                <Ionicons name="information-circle" size={24} color="#6366f1" />
                <Text className="ml-3 text-lg font-bold text-gray-800">
                  About this exercise
                </Text>
              </View>
              <Text className="text-gray-600 leading-7">
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Primary Target */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart" size={26} color="#ec4899" />
              <Text className="ml-3 text-lg font-bold text-gray-800">
                Primary Target
              </Text>
            </View>
            <Text className="text-3xl font-extrabold text-pink-600 capitalize">
              {exercise.target}
            </Text>
          </View>

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles?.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={26}
                  color="#6366f1"
                />
                <Text className="ml-3 text-lg font-bold text-gray-800">
                  Secondary Muscles
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {exercise.secondaryMuscles.map((m: string) => (
                  <View
                    key={m}
                    className="bg-indigo-50 px-4 py-2.5 rounded-full"
                  >
                    <Text className="text-indigo-700 font-semibold capitalize">
                      {m}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions?.length > 0 && (
            <View>
              <View className="flex-row items-center mb-6">
                <Feather name="list" size={26} color="#10b981" />
                <Text className="ml-3 text-xl font-bold text-gray-800">
                  Step-by-Step Guide
                </Text>
              </View>

              {exercise.instructions.map((step: string, index: number) => (
                <View key={index} className="flex-row mb-5">
                  <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center mr-4 shadow-md">
                    <Text className="text-white font-bold text-lg">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-gray-700 text-base leading-7">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={addToUserLibrary}
            activeOpacity={0.85}
            className="bg-pink-600 py-5 rounded-2xl items-center shadow-2xl "
          >
            <Text className="text-white text-2xl font-extrabold tracking-tight">
              Add to My Library
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
