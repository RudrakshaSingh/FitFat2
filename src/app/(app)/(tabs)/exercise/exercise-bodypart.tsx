import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageBackground } from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";

export default function ExcerciseBodypart() {
  const router = useRouter();
  const { bodyPart, bodyPartImage } = useLocalSearchParams<{
    bodyPart?: string;
    bodyPartImage?: string;
  }>();

  const [allExercises, setAllExercises] = useState([]);
  const [displayedExercises, setDisplayedExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 20;
  const imageUri =
    bodyPartImage ||
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80";

  const fetchAllExercises = async () => {
    if (!bodyPart) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(
          bodyPart.toLowerCase()
        )}`,
        {
          params: { limit: 1000 },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        }
      );

      const data = res.data;
      setAllExercises(data);
      setDisplayedExercises(data.slice(0, PAGE_SIZE));
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bodyPart) {
      fetchAllExercises();
    }
  }, [bodyPart]);

  const loadMore = () => {
    if (loadingMore || displayedExercises.length >= allExercises.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextPage = Math.floor(displayedExercises.length / PAGE_SIZE) + 1;
      const start = nextPage * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const more = allExercises.slice(start, end);

      setDisplayedExercises((prev) => [...prev, ...more]);
      setLoadingMore(false);
    }, 300); // Small delay for smooth feel
  };

  const renderExercise = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-100"
      onPress={() => {
        console.log("Tapped:", item.name);
        // Later: navigate to detail
      }}
    >
      <View className="flex-row">
        <Image
          source={{ uri: item.gifUrl }}
          className="w-32 h-32"
          resizeMode="cover"
        />

        <View className="flex-1 justify-center px-4">
          <Text className="text-lg font-bold text-gray-900 capitalize leading-6">
            {item.name.replace(/-/g, " ")}
          </Text>
          <Text className="text-sm text-pink-600 font-semibold mt-1">
            {item.target}
          </Text>
          <Text className="text-xs text-gray-500 mt-1 capitalize">
            {item.equipment}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const totalCount = allExercises.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["left", "right"]}>
      {/* Hero */}
      <ImageBackground
        source={{ uri: imageUri }}
        className="w-full h-80 justify-end"
        resizeMode="cover"
      >
        <View className="absolute top-12 left-2 right-2 z-10 px-4">
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
            className="h-10 w-10 bg-black rounded-full items-center justify-center backdrop-blur-md"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="absolute inset-0 bg-black/60" />
        <View className="px-8 pb-10">
          <Text className="text-5xl font-extrabold text-white text-center tracking-tight">
            {bodyPart?.charAt(0).toUpperCase() + bodyPart?.slice(1)}
          </Text>

          <Text className="text-lg text-white/90 text-center mt-2 font-medium">
            Target your {bodyPart?.toLowerCase()} with precision
          </Text>
        </View>
      </ImageBackground>

      {/* Exercise List */}
      <View className="flex-1 bg-gray-50 rounded-t-3xl  px-6 ">
        <Text className="text-xl text-black/90 text-center mt-3 font-medium">
          {totalCount > 0 ? `${totalCount} Exercises` : "Loading..."}
        </Text>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ec4899" />
            <Text className="text-gray-600 mt-4 text-lg">
              Loading {bodyPart} exercises...
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedExercises}
            keyExtractor={(item) => item.id}
            renderItem={renderExercise}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-6 items-center">
                  <ActivityIndicator size="small" color="#ec4899" />
                  <Text className="text-gray-500 mt-2">Loading more...</Text>
                </View>
              ) : displayedExercises.length < totalCount ? (
                <View className="py-6 items-center">
                  <Text className="text-gray-500">
                    {displayedExercises.length} of {totalCount} shown
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text className="text-center text-gray-500 py-10 text-lg">
                No exercises found
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
