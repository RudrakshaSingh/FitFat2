import { Exercise } from "@/lib/sanity/type";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { client, urlFor } from "@/lib/sanity/client";
import {
  getDifficultyColor,
  getDifficultyText,
} from "../../components/ExerciseCard";
import Markdown from "react-native-markdown-display";

export default function ExerciseDetail() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiGuidance, setAIGuidance] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const { id } = useLocalSearchParams();
  const { user } = useUser();

  useEffect(() => {
    // Fetch exercise details based on the id
    const fetchExercise = async () => {
      try {
        const query = `*[_type == "exercise" && _id == $id][0]`;
        const exerciseData = await client.fetch(query, { id });
        setExercise(exerciseData);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        fetchExercise();
    }
  }, [id]);

  const getAIGuidance = async () => {
    if (!exercise) return;
    setAILoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exerciseName: exercise.name }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI guidance. Please try again.");
      }

      const data = await response.json();
      setAIGuidance(data.message);
    } catch (error) {
      console.error("Error fetching AI guidance:", error);
      setAIGuidance("Failed to fetch AI guidance. Please try again.");
    } finally {
      setAILoading(false);
    }
  };

  const handleDelete = async () => {
    if (!exercise || !user) return;
    if (loading) return;

    setLoading(true);

    try {
        // Check for references first
        const count = await client.fetch(
            `count(*[_type == "workout" && references($id)])`,
            { id: exercise._id }
        );

        if (count > 0) {
            setLoading(false); // Stop loading to show alert
            Alert.alert(
                "⚠️ Usage Warning",
                `This exercise is used in ${count} workout(s). \n\nDeleting it will PERMANENTLY DELETE those entire workout logs from your history.\n\nThis cannot be undone.`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete All & History",
                        style: "destructive",
                        onPress: () => performDelete(true),
                    },
                ]
            );
        } else {
             // No references, confirm standard delete
             setLoading(false);
             Alert.alert(
                "Delete Exercise",
                "Are you sure you want to delete this exercise?",
                [
                    { text: "Cancel", style: "cancel" },
                    { 
                        text: "Delete", 
                        style: "destructive", 
                        onPress: () => performDelete(false) 
                    }
                ]
             );
        }
    } catch (error) {
        console.error("Check references error:", error);
        setLoading(false);
        Alert.alert("Error", "Could not verify exercise usage.");
    }
  };

  const performDelete = async (cascade: boolean) => {
    setLoading(true);
    try {
        const response = await fetch("/api/delete-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: exercise?._id, userId: user?.id, cascade }),
        });
        
        const data = await response.json();

        if (response.ok) {
            router.back();
        } else {
            Alert.alert("Error", data.error || "Failed to delete exercise");
            setLoading(false);
        }
    } catch (error) {
        console.error("Delete error:", error);
        Alert.alert("Error", "Something went wrong.");
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#9333ea" />
          <Text className="text-gray-600 mt-2">Loading Exercise...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500 text-lg mb-4">
            Exercise not found
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with close button */}
      <View className="absolute top-12 left-4 right-4 z-10 flex-row justify-between items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 bg-black/30 rounded-full items-center justify-center backdrop-blur-md"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {exercise?.userId === user?.id && (
            <TouchableOpacity
            onPress={handleDelete}
            className="h-10 w-10 bg-red-500/80 rounded-full items-center justify-center backdrop-blur-md"
            >
            <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image */}
        <View className="h-96 w-full relative">
          {exercise?.image ? (
            <Image
              source={{ uri: urlFor(exercise.image.asset!._ref).url() }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-indigo-100 items-center justify-center">
              <Ionicons name="images-outline" size={64} color="#a5b4fc" />
            </View>
          )}
          {/* Gradient overlay */}
          <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />
        </View>

        {/* Content Container - overlapping result */}
        <View className="-mt-8 bg-gray-50 rounded-t-[32px] px-6 pt-8 pb-10 flex-1 min-h-[500px]">
            
          {/* Title and Difficulty */}
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                {exercise?.name}
              </Text>
              <View
                className={`self-start px-4 py-1.5 rounded-full ${getDifficultyColor(
                  exercise?.difficulty
                )} bg-opacity-90`}
              >
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  {getDifficultyText(exercise?.difficulty)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              About this exercise
            </Text>
            <Text className="text-gray-600 leading-7 text-base">
              {exercise?.description ||
                "No description provided for this exercise."}
            </Text>
          </View>

          {/* Video section */}
          {exercise?.videoUrl && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                Video Tutorial
              </Text>

              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center shadow-sm"
                onPress={() => {
                    let url = exercise.videoUrl;
                    if (url && !/^https?:\/\//i.test(url)) {
                        url = 'https://' + url;
                    }
                    Linking.openURL(url!);
                }}
                activeOpacity={0.7}
              >
                <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="play" size={24} color="#EF4444" />
                </View>

                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    Watch Demo
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Open video link
                  </Text>
                </View>
                
                <Ionicons name="open-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          )}

          {/* Ai Guidance */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Ionicons name="sparkles" size={20} color="#2563EB" />
                </View>
                <Text className="text-xl font-bold text-gray-900">
                  AI Coach
                </Text>
            </View>

            {(aiGuidance || aiLoading) && (
                 <View className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm mb-4">
                    {aiLoading ? (
                        <View className="items-center py-4">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-gray-500 mt-3 font-medium">
                            Analyzing form & technique...
                        </Text>
                        </View>
                    ) : (
                        <Markdown
                        style={{
                            body: { color: "#374151", fontSize: 16, lineHeight: 24 },
                            heading2: { fontSize: 18, fontWeight: "bold", color: "#111827", marginTop: 16, marginBottom: 8 },
                        }}
                        >
                        {aiGuidance}
                        </Markdown>
                    )}
                </View>
            )}

            {/* Ai Coaching button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center shadow-md ${
                aiLoading
                  ? "bg-gray-300"
                  : aiGuidance
                  ? "bg-gray-900"
                  : "bg-blue-600"
              }`}
              disabled={aiLoading}
              onPress={getAIGuidance}
              activeOpacity={0.8}
            >
              {aiLoading ? (
                 <Text className="text-white font-bold text-lg">Thinking...</Text>
              ) : (
                <View className="flex-row items-center justify-center">
                    <Ionicons name={aiGuidance ? "refresh" : "bulb-outline"} size={20} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg">
                    {aiGuidance
                        ? "Refresh Advice"
                        : "Get AI Tips"}
                    </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View className="h-10" /> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
