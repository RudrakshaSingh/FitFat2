import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router"; // or useRoute() if using React Navigation

export default function ExcerciseBodypart() {
  // Get passed params (bodyPart + bodyPartImage)
  const { bodyPart, bodyPartImage } = useLocalSearchParams<{
    bodyPart?: string;
    bodyPartImage?: string;
  }>();

  // Fallback if image fails or not passed
  const imageUri =
    bodyPartImage ||
    "https://via.placeholder.com/600x400/1f2937/ffffff?text=Workout";

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["left", "right"]}>
      {/* Hero Section with Image + Title */}
      <ImageBackground
        source={{ uri: imageUri }}
        className="w-full h-80 justify-end"
        resizeMode="cover"
      >
        {/* Dark overlay for text readability */}
        <View className="absolute inset-0 bg-black/50" />

        {/* Title */}
        <View className="px-8 pb-10">
          <Text className="text-5xl font-extrabold text-white text-center tracking-tight drop-shadow-2xl">
            {bodyPart || "Exercises"}
          </Text>
          <Text className="text-lg text-white/90 text-center mt-2 font-medium">
            Target your {bodyPart?.toLowerCase()} with precision
          </Text>
        </View>
      </ImageBackground>

      {/* Content Area (for future exercise list) */}
      <View className="flex-1 bg-gray-50 rounded-t-3xl -mt-6 px-6 pt-8">
        <Text className="text-gray-600 text-center">
          Exercises for{" "}
          <Text className="font-bold text-gray-800">{bodyPart}</Text> will
          appear here
        </Text>
      </View>
    </SafeAreaView>
  );
}
