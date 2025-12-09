import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { client, urlFor } from "@/lib/sanity/client";

interface Exercise {
  _id: string;
  name: string;
  description: string;
  difficulty: string;
  image: any;
}

export default function UserLibrary() {
  const router = useRouter();
  const { user } = useUser();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExercises = async () => {
    if (!user) return;
    try {
      const query = `*[_type == "exercise" && userId == $userId] {
        _id,
        name,
        description,
        difficulty,
        image,
        videoUrl
      }`;
      const data = await client.fetch(query, { userId: user.id });
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
        fetchExercises();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchExercises();
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <TouchableOpacity 
        onPress={() => router.push(`/(app)/user-library/${item._id}`)}
        activeOpacity={0.7}
        className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100 p-3 flex-row items-center"
    >
      {item.image ? (
        <Image
          source={{ uri: urlFor(item.image).width(200).url() }}
          className="w-20 h-20 rounded-lg bg-gray-200"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-lg bg-gray-200 justify-center items-center">
            <Ionicons name="barbell" size={24} color="#9ca3af" />
        </View>
      )}
      <View className="flex-1 ml-4 justify-center">
        <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
        <Text
          className="text-sm text-gray-500 mt-1"
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <View className="mt-2 flex-row items-center">
            <View className={`px-2 py-0.5 rounded-full ${
                item.difficulty === 'beginner' ? 'bg-green-100' : 
                item.difficulty === 'intermediate' ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs capitalize font-medium ${
                  item.difficulty === 'beginner' ? 'text-green-700' : 
                  item.difficulty === 'intermediate' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {item.difficulty}
              </Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">My Library</Text>
         <TouchableOpacity onPress={() => router.push("/(app)/user-library/add-custom-exercise")} className="p-2 -mr-2">
            <Ionicons name="add-circle" size={32} color="#9333ea" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#9333ea" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9333ea" />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
              <Text className="text-gray-500 text-lg mt-4 font-medium">No exercises found</Text>
              <Text className="text-gray-400 text-center mt-2 px-10">
                Tap the + button to create your first custom exercise!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
