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

  const [allExercises, setAllExercises] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Extract unique equipment & muscles
  const { equipmentList, musclesList } = useMemo(() => {
    const equipmentSet = new Set<string>();
    const muscleSet = new Set<string>();

    allExercises.forEach((ex) => {
      if (ex.equipment) equipmentSet.add(ex.equipment);
      if (ex.target) muscleSet.add(ex.target);
    });

    return {
      equipmentList: Array.from(equipmentSet).sort(),
      musclesList: Array.from(muscleSet).sort(),
    };
  }, [allExercises]);

  const fetchAllExercises = async (isRefresh = false) => {
    if (!bodyPart) return;

    if (isRefresh) {
      // Full reset on refresh
      setAllExercises([]);
      setSearchQuery("");
      setSelectedEquipment(null);
      setSelectedMuscle(null);
      setShowFilters(false);
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      setAllExercises(res.data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (bodyPart) fetchAllExercises();
  }, [bodyPart]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      const matchesSearch = ex.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesEquipment =
        !selectedEquipment || ex.equipment === selectedEquipment;
      const matchesMuscle = !selectedMuscle || ex.target === selectedMuscle;
      return matchesSearch && matchesEquipment && matchesMuscle;
    });
  }, [allExercises, searchQuery, selectedEquipment, selectedMuscle]);

  const toggleFilter = (type: "equipment" | "muscle", value: string) => {
    if (type === "equipment") {
      setSelectedEquipment((prev) => (prev === value ? null : value));
    } else {
      setSelectedMuscle((prev) => (prev === value ? null : value));
    }
  };

  const goToExerciseDetail = (exercise: any) => {
    router.push({
      pathname: "(modals)/exercise-details",
      params: {
        exercise: JSON.stringify(exercise),
      },
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
            {item.equipment}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["left", "right"]}>
      {/* Hero */}
      <ImageBackground
        source={{ uri: bodyPartImage }}
        className="w-full h-80 justify-end"
        resizeMode="cover"
      >
        <View className="absolute top-12 left-6 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>
        <View className="absolute inset-0 bg-black/60" />
        <View className="px-8 pb-10">
          <Text className="text-5xl font-extrabold text-white text-center tracking-tight">
            {bodyPart?.charAt(0).toUpperCase() + bodyPart?.slice(1)}
          </Text>
          <Text className="text-lg text-white/90 text-center mt-2 font-medium">
            {filteredExercises.length} exercises available
          </Text>
        </View>
      </ImageBackground>

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
          <View className="mt-5 pb-6">
            {equipmentList.length > 0 && (
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Equipment
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row pr-6">
                    {equipmentList.map((eq) => (
                      <TouchableOpacity
                        key={eq}
                        onPress={() => toggleFilter("equipment", eq)}
                        className={`mr-3 px-5 py-2.5 rounded-full border-2 ${
                          selectedEquipment === eq
                            ? "bg-pink-600 border-pink-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Text
                          className={`font-medium capitalize ${
                            selectedEquipment === eq
                              ? "text-white"
                              : "text-gray-700"
                          }`}
                        >
                          {eq}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {musclesList.length > 0 && (
              <View>
                <Text className="text-sm font-semibold text-gray-700 mb-3">
                  Target Muscle
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row pr-6">
                    {musclesList.map((muscle) => (
                      <TouchableOpacity
                        key={muscle}
                        onPress={() => toggleFilter("muscle", muscle)}
                        className={`mr-3 px-5 py-2.5 rounded-full border-2 ${
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

            {(selectedEquipment || selectedMuscle) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedEquipment(null);
                  setSelectedMuscle(null);
                }}
                className="mt-5"
              >
                <Text className="text-pink-600 font-semibold text-center text-base">
                  Clear All Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Exercise List with Perfect Refresh */}
      <View className="flex-1 bg-gray-50 px-6 pb-6">
        {loading || refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ec4899" />
            <Text className="text-gray-600 mt-4 text-lg">
              Loading exercises...
            </Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">No exercises found</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            renderItem={renderExercise}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAllExercises(true)}
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
