// app/exercise-muscle.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "exercisedb.p.rapidapi.com";

export default function ExerciseMuscle() {
  const router = useRouter();
  const { muscle } = useLocalSearchParams<{ muscle?: string }>();

  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Extract unique body parts (since muscle is fixed)
  const bodyPartsList = useMemo(() => {
    const set = new Set<string>();
    allExercises.forEach((ex) => ex.bodyPart && set.add(ex.bodyPart));
    return Array.from(set).sort();
  }, [allExercises]);

  const fetchExercises = async (isRefresh = false) => {
    if (!muscle) return;

    if (isRefresh) {
      setAllExercises([]);
      setSearchQuery("");
      setSelectedBodyPart(null);
      setShowFilters(false);
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises/target/${encodeURIComponent(
          muscle.toLowerCase()
        )}`,
        {
          params: { limit: 1000 },
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        }
      );
      setAllExercises(res.data || []);
    } catch (error) {
      console.error("Failed to fetch exercises for muscle:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (muscle) fetchExercises();
  }, [muscle]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesBodyPart =
        !selectedBodyPart || ex.bodyPart === selectedBodyPart;
      return matchesSearch && matchesBodyPart;
    });
  }, [allExercises, searchQuery, selectedBodyPart]);

  const goToExerciseDetail = (exercise: any) => {
    router.push({
      pathname: "(modals)/exercise-details",
      params: { exercise: JSON.stringify(exercise) },
    });
  };

  const renderExercise = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden mb-4 shadow-lg border border-gray-100"
      onPress={() => goToExerciseDetail(item)}
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
          <Text className="text-sm text-purple-600 font-semibold mt-1 capitalize">
            {item.target}
          </Text>
          <Text className="text-xs text-gray-500 mt-1 capitalize">
            {item.bodyPart} • {item.equipment}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-gray-900"
      edges={["left", "right", "bottom"]}
    >
      {/* Hero Header*/}
      <View className="w-full h-72 bg-gradient-to-br from-purple-600 via-purple-700 to-violet-700 justify-end">
        {/* Back Button */}
        <View className="absolute top-12 left-6 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 bg-black/40 rounded-full items-center justify-center backdrop-blur-md shadow-lg"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-8 pb-10">
          <View className="items-center">
            <View className="bg-white/20 backdrop-blur-2xl rounded-3xl px-10 py-6 shadow-2xl border border-white/10">
              <Text className="text-white text-5xl font-extrabold capitalize text-center leading-tight">
                {muscle}
              </Text>
            </View>

            <Text className="text-white/90 text-lg font-medium mt-4">
              {filteredExercises.length} exercises available
            </Text>
          </View>
        </View>
      </View>

      {/* Search + Filter */}
      <View className="px-6 pt-6 pb-3 bg-gray-50 rounded-t-3xl -mt-6">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
            <Ionicons name="search" size20 color="#9333EA" />
            <TextInput
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="ml-3 flex-1 text-base"
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#aaa" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="h-12 w-12 bg-purple-600 rounded-2xl items-center justify-center shadow-lg"
          >
            <Ionicons
              name={showFilters ? "close" : "options-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Body Part Filter */}
        {showFilters && bodyPartsList.length > 0 && (
          <View className="mt-5 pb-6">
            <Text className="text-sm font-bold text-gray-800 mb-3 flex-row items-center">
              <Ionicons name="body" size={18} color="#9333EA" />
              <Text className="ml-2">Body Part</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-6">
                {bodyPartsList.map((part) => (
                  <TouchableOpacity
                    key={part}
                    onPress={() =>
                      setSelectedBodyPart((prev) =>
                        prev === part ? null : part
                      )
                    }
                    className={`px-5 py-2.5 rounded-full border-2 ${
                      selectedBodyPart === part
                        ? "bg-purple-600 border-purple-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`font-medium capitalize ${
                        selectedBodyPart === part
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {part}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {(selectedBodyPart || searchQuery) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedBodyPart(null);
                  setSearchQuery("");
                }}
                className="mt-4"
              >
                <Text className="text-purple-600 font-bold text-center">
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Exercise List */}
      <View className="flex-1 bg-gray-50 px-6 pb-6">
        {loading || refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="text-gray-600 mt-4 text-lg">
              Loading {muscle} exercises...
            </Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="fitness-outline" size={80} color="#ddd" />
            <Text className="text-gray-500 text-xl font-semibold mt-6">
              No exercises found
            </Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-10">
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={renderExercise}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchExercises(true)}
                colors={["#9333EA"]}
                tintColor="#9333EA"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
