import React from "react";
import { TouchableOpacity, Text, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ExerciseDetail() {
  const router = useRouter();
  const { exercise: raw } = useLocalSearchParams<{ exercise?: string }>();
  const exercise = raw ? JSON.parse(raw) : null;

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
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
    console.log("added ");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-6 z-20 h-11 w-11 bg-black/50 rounded-full items-center justify-center"
      >
        <Ionicons name="arrow-back" size={26} color="white" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ★ Static Header Image */}
        <Image
          source={{ uri: exercise.gifUrl }}
          className="w-full h-96"
          resizeMode="contain"
        />

        {/* ★ Header Overlay Title */}
        <View className="absolute top-60 left-6 z-10">
          <Text className="text-white font-extrabold text-4xl capitalize">
            {exercise.name.replace(/-/g, " ")}
          </Text>
          <Text className="text-pink-300 mt-1 text-lg font-semibold capitalize">
            {exercise.target} • {exercise.bodyPart}
          </Text>
        </View>

        {/* ★ Body Card */}
        <View className="bg-white rounded-t-3xl -mt-10 px-6 pt-8 pb-16 shadow-lg">
          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-6">
            <View className="flex-row bg-pink-50 px-4 py-2 rounded-full items-center">
              <MaterialCommunityIcons
                name="weight-lifter"
                size={16}
                color="#db2777"
              />
              <Text className="ml-2 text-pink-700 font-semibold capitalize">
                {exercise.equipment}
              </Text>
            </View>

            <View className={`px-4 py-2 rounded-full ${difficultyColor}`}>
              <Text className="text-white font-bold capitalize">
                {exercise.difficulty}
              </Text>
            </View>

            <View className="flex-row bg-gray-100 px-4 py-2 rounded-full items-center">
              <Feather name="zap" size={16} color="#fb923c" />
              <Text className="ml-2 text-gray-700 font-semibold">
                {exercise.category}
              </Text>
            </View>
          </View>

          {/* Description */}
          {exercise.description && (
            <View className="bg-gray-100 p-5 rounded-2xl border border-gray-200 mb-8">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={22} color="#6366f1" />
                <Text className="ml-3 text-lg font-extrabold text-gray-900">
                  About this exercise
                </Text>
              </View>
              <Text className="text-gray-600 leading-7 text-base">
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Primary Target */}
          <View className="mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart" size={24} color="#ec4899" />
              <Text className="ml-3 text-lg font-extrabold text-gray-900">
                Primary Target
              </Text>
            </View>
            <Text className="text-3xl font-black text-pink-600 capitalize">
              {exercise.target}
            </Text>
          </View>

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles?.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-4">
                <MaterialCommunityIcons
                  name="arm-flex"
                  size={24}
                  color="#6366f1"
                />
                <Text className="ml-3 text-lg font-extrabold text-gray-900">
                  Secondary Muscles
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {exercise.secondaryMuscles.map((m: string) => (
                  <View key={m} className="bg-indigo-50 px-4 py-2 rounded-full">
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
                <Feather name="list" size={22} color="#10b981" />
                <Text className="ml-3 text-xl font-extrabold text-gray-900">
                  Step-by-Step Guide
                </Text>
              </View>

              {exercise.instructions.map((step: string, index: number) => (
                <View key={index} className="flex-row mb-6">
                  <View className="w-10 h-10 bg-emerald-500 rounded-full items-center justify-center">
                    <Text className="text-white font-extrabold text-lg">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 ml-4 text-gray-700 text-base leading-7">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={addToUserLibrary}
            className="flex-row items-center justify-center bg-pink-600 px-4 py-3 rounded-full"
          >
            <Ionicons name="add-circle" size={22} color="white" />
            <Text className="ml-2 text-lg font-bold text-white">
              Add to my Library
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
