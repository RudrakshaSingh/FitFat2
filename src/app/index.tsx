import React from "react";
import { Image, Text, View, Pressable, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import bgImage from "../../assets/bg-image.jpg";

export default function Start() {
  const router = useRouter();

  return (
    <View className="flex-1">
      <StatusBar hidden />
      <Image
        source={bgImage}
        className="w-full h-full"
        style={{ resizeMode: "cover" }}
      />

      <SafeAreaView
        edges={["bottom"]}
        className="absolute inset-0 flex-1 justify-end"
      >
        <View className="mb-10 mx-10 items-center">
          <Text className="text-3xl text-center font-bold text-white mb-4">
            Best <Text className="text-red-500">Workouts</Text> For You
          </Text>

          <Pressable
            className="bg-red-500 rounded-full py-4 w-full shadow-lg border border-white"
            onPress={() => {
              router.push("/(app)/(tabs)");
            }}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Start Now
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
