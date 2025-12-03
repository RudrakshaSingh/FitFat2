import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { Exercise } from "@/lib/sanity/type";
import ExerciseCard from "@/app/components/ExerciseCard";
import { useUser } from "@clerk/clerk-expo";

//Define query outside the component for proper type generation
export const exerciseQuery = defineQuery(`
  *[_type == "exercise" && userId == $userId]
`);

export default function Exercises() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const fetchExercises = async () => {
    // Fetch exercises from Sanity
    try {
      const exercises = await client.fetch(exerciseQuery, {
        userId: user?.id,
      });

      // console.log("ex:", exercises);

      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  useEffect(() => {
    if (user?.id) fetchExercises();
  }, [user]);

  useEffect(() => {
    const cleanedQuery = searchQuery.trim().replace(/\s+/g, " ").toLowerCase();

    const filtered = exercises.filter((exercise: Exercise) =>
      exercise.name.toLowerCase().includes(cleanedQuery)
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Exercise Library
        </Text>

        <Text className="text-gray-600 mt-1">
          Discover and master new exercises
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4">
          <Ionicons name="search" size={20} color="#687280" />

          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Search exercises..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#687280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`exercise-detail?id=${item._id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]} // Android
            tintColor="#3882F6" // iOS spinner color
            title="Pull to refresh exercises"
            titleColor="#687280"
          />
        }
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />

            <Text className="text-xl font-semibold text-gray-900 mt-4">
              {searchQuery ? "No exercises found" : "Loading exercises..."}
            </Text>

            <Text className="text-gray-600 text-center mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Your exercises will appear here"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
