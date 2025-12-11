import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkoutStore } from "store/workout-store";
import { useUser } from "@clerk/clerk-expo";
import ExerciseCard from "./ExerciseCard";
import { Exercise } from "@/lib/sanity/type";
import { client } from "@/lib/sanity/client";
import { defineQuery } from "groq";

// Query moved inside component to use userId


interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ExerciseSelectionModal({
  visible,
  onClose,
}: ExerciseSelectionModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const { addExerciseToWorkout } = useWorkoutStore();
  const [exercises, setExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible && user?.id) {
      fetchExercises();
    }
  }, [visible, user?.id]);

  useEffect(() => {
    const cleanedQuery = searchQuery.trim().replace(/\s+/g, " ").toLowerCase();

    const filtered = exercises.filter((exercise: Exercise) =>
      exercise.name.toLowerCase().includes(cleanedQuery)
    );
    setFilteredExercises(filtered);
  }, [searchQuery, exercises]);

  const fetchExercises = async () => {
    if (!user?.id) return;
    
    try {
      // Don't set isLoading(true) here if refreshing, handled by refreshing state
      if (!refreshing) setIsLoading(true);
      
      const exercises = await client.fetch(
        defineQuery('*[_type == "exercise" && userId == $userId]'),
        { userId: user.id }
      );
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExercisePress = (exercise: Exercise) => {
    addExerciseToWorkout({ name: exercise.name, sanityId: exercise._id });
    onClose();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View className="bg-white px-4 pt-4 pb-6 shadow-sm border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-800">
              Add Exercise
            </Text>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4">
            Tap any exercise to add it to your workout
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />

            <TextInput
              className="flex-1 ml-3 text-gray-800"
              placeholder="Search exercises ..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Exercise List */}
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ExerciseCard
              item={item}
              onPress={() => handleExercisePress(item)}
              showChevron={false}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 32,
            paddingHorizontal: 16,
            flexGrow: 1, // Ensures empty component centers correctly
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3B82F6"]} // Android
              tintColor="#3B82F6" // iOS
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              {isLoading ? (
                <>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className="text-lg font-semibold text-gray-400 mt-4">
                    Loading exercises...
                  </Text>
                  <Text className="text-sm text-gray-400 mt-2">
                    Please wait a moment
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="fitness-outline" size={64} color="#D1D5DB" />
                  <Text className="text-lg font-semibold text-gray-400 mt-4">
                    {searchQuery ? "No exercises found" : "No exercises in your library"}
                  </Text>
                  <Text className="text-sm text-gray-400 mt-2 text-center max-w-[250px]">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "Create your first exercise to get started"}
                  </Text>
                </>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
