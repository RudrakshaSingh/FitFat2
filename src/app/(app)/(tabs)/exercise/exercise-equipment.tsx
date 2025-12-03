// app/exercise-equipment.tsx
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

export default function ExerciseEquipment() {
  const router = useRouter();
  const { equipment } = useLocalSearchParams<{ equipment?: string }>();

  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Extract unique muscles & body parts
  const { musclesList, bodyPartsList } = useMemo(() => {
    const muscleSet = new Set<string>();
    const bodyPartSet = new Set<string>();

    allExercises.forEach((ex) => {
      if (ex.target) muscleSet.add(ex.target);
      if (ex.bodyPart) bodyPartSet.add(ex.bodyPart);
    });

    return {
      musclesList: Array.from(muscleSet).sort(),
      bodyPartsList: Array.from(bodyPartSet).sort(),
    };
  }, [allExercises]);

  const fetchExercises = async (isRefresh = false) => {
    if (!equipment) return;

    if (isRefresh) {
      setAllExercises([]);
      setSearchQuery("");
      setSelectedMuscle(null);
      setSelectedBodyPart(null);
      setShowFilters(false);
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await axios.get(
        `https://exercisedb.p.rapidapi.com/exercises/equipment/${encodeURIComponent(
          equipment.toLowerCase()
        )}?limit=1000`,
        {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        }
      );
      setAllExercises(res.data || []);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (equipment) fetchExercises();
  }, [equipment]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesMuscle = !selectedMuscle || ex.target === selectedMuscle;
      const matchesBodyPart =
        !selectedBodyPart || ex.bodyPart === selectedBodyPart;
      return matchesSearch && matchesMuscle && matchesBodyPart;
    });
  }, [allExercises, searchQuery, selectedMuscle, selectedBodyPart]);

  const toggleFilter = (type: "muscle" | "bodypart", value: string) => {
    if (type === "muscle") {
      setSelectedMuscle((prev) => (prev === value ? null : value));
    } else {
      setSelectedBodyPart((prev) => (prev === value ? null : value));
    }
  };

  const clearAllFilters = () => {
    setSelectedMuscle(null);
    setSelectedBodyPart(null);
    setSearchQuery("");
  };

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
          <Text className="text-sm text-pink-600 font-semibold mt-1 capitalize">
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
      {/* Hero Header */}
      <View className="w-full h-72 bg-gradient-to-br from-pink-600 via-pink-700 to-rose-700 justify-end">
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
                {equipment}
              </Text>
            </View>

            <Text className="text-white/90 text-lg font-medium mt-4">
              {filteredExercises.length} exercises available
            </Text>
          </View>
        </View>
      </View>

      {/* Search + Filter Bar */}
      <View className="px-6 pt-6 pb-3 bg-gray-50 rounded-t-3xl -mt-6">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
            <Ionicons name="search" size={20} color="#ec4899" />
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
            className="h-12 w-12 bg-pink-600 rounded-2xl items-center justify-center shadow-lg"
          >
            <Ionicons
              name={showFilters ? "close" : "options-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View className="mt-5 pb-6 space-y-6">
            {/* Target Muscle Filter */}
            {musclesList.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-gray-800 mb-3 flex-row items-center">
                  <Ionicons name="heart" size={18} color="#ec4899" />
                  <Text className="ml-2">Target Muscle</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3 pr-6">
                    {musclesList.map((muscle) => (
                      <TouchableOpacity
                        key={muscle}
                        onPress={() => toggleFilter("muscle", muscle)}
                        className={`px-5 py-2.5 rounded-full border-2 ${
                          selectedMuscle === muscle
                            ? "bg-pink-600 border-pink-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`font-medium capitalize ${
                            selectedMuscle === muscle
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {muscle}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* Body Part Filter */}
            {bodyPartsList.length > 0 && (
              <View>
                <Text className="text-sm font-bold text-gray-800 mb-3 flex-row items-center">
                  <Ionicons name="body" size={18} color="#6366f1" />
                  <Text className="ml-2">Body Part</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-3 pr-6">
                    {bodyPartsList.map((part) => (
                      <TouchableOpacity
                        key={part}
                        onPress={() => toggleFilter("bodypart", part)}
                        className={`px-5 py-2.5 rounded-full border-2 ${
                          selectedBodyPart === part
                            ? "bg-indigo-600 border-indigo-600"
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
              </View>
            )}

            {/* Clear All */}
            {(selectedMuscle || selectedBodyPart || searchQuery) && (
              <TouchableOpacity onPress={clearAllFilters} className="mt-4">
                <Text className="text-pink-600 font-bold text-center text-base">
                  Clear All Filters
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
            <ActivityIndicator size="large" color="#ec4899" />
            <Text className="text-gray-600 mt-4 text-lg">
              Loading {equipment} exercises...
            </Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="barbell-outline" size={80} color="#ddd" />
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
                colors={["#ec4899"]}
                tintColor="#ec4899"
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
