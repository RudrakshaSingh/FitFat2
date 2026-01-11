import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { launchImageLibraryAsync, MediaType } from "expo-image-picker";
import { useUser } from "@clerk/clerk-expo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { addExerciseToLibrary } from "@/lib/sanity/sanity-service";
import CustomAlert from "@/app/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export default function AddCustomExercise() {
  const router = useRouter();
  const { user } = useUser();
  const alert = useCustomAlert();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [target, setTarget] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Common target muscles
  const targetMuscles = [
    "abductors", "abs", "adductors", "biceps", "calves", 
    "cardiovascular system", "delts", "forearms", "glutes", 
    "hamstrings", "lats", "levator scapulae", "pectorals", 
    "quads", "serratus anterior", "spine", "traps", 
    "triceps", "upper back"
  ];

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // IMPORTANT: Get base64 data
    });

    if (!result.canceled) {
        if (result.assets[0].base64) {
             setImage(`data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`);
        } else {
             setImage(result.assets[0].uri);
        }
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert.showAlert("Error", "Please enter an exercise name");
      return;
    }

    setSubmitting(true);

    try {
      const exercise = {
        name: name.trim(),
        description,
        difficulty: difficulty || "beginner",
        target: target || undefined,
        videoUrl: videoUrl.trim() 
          ? (/^https?:\/\//i.test(videoUrl.trim()) ? videoUrl.trim() : `https://${videoUrl.trim()}`) 
          : undefined,
        gifUrl: image || undefined,
      };

      const result = await addExerciseToLibrary(user!.id, exercise);

      if (result.success) {
        alert.showAlert("Success", "Exercise added successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else if (result.error === "duplicate") {
        alert.showAlert("Oops!", "This exercise already exists in your library.");
      } else {
        alert.showAlert("Error", result.message || "Failed to save exercise. Try again.");
      }
    } catch (error) {
      console.error(error);
      alert.showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
       <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Add Exercise</Text>
      </View>

      <KeyboardAwareScrollView className="flex-1 px-6 pt-6">
        {/* Name */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Name</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="e.g. Jumping Jacks"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Image Picker */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Image (Optional)</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="h-48 bg-white border border-dashed border-gray-300 rounded-xl justify-center items-center overflow-hidden"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={32} color="#9ca3af" />
                <Text className="text-gray-400 mt-2">Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Difficulty */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Difficulty</Text>
          <View className="flex-row gap-3">
            {["beginner", "intermediate", "advanced"].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setDifficulty(level)}
                className={`flex-1 py-3 px-2 rounded-xl border ${
                  difficulty === level
                    ? "bg-purple-100 border-purple-500"
                    : "bg-white border-gray-200"
                } items-center`}
              >
                <Text
                  className={`capitalize font-medium ${
                    difficulty === level ? "text-purple-700" : "text-gray-600"
                  }`}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Muscle */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Target Muscle (Optional)</Text>
          <View className="flex-row flex-wrap gap-2">
            {targetMuscles.map((muscle) => (
              <TouchableOpacity
                key={muscle}
                onPress={() => setTarget(target === muscle ? "" : muscle)}
                className={`py-2 px-3 rounded-full border ${
                  target === muscle
                    ? "bg-pink-100 border-pink-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`capitalize text-sm font-medium ${
                    target === muscle ? "text-pink-700" : "text-gray-600"
                  }`}
                >
                  {muscle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
           <TextInput
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800 h-32"
            placeholder="Describe the steps..."
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#9ca3af"
          />
        </View>
        
        {/* Video URL */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Video URL (Optional)</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl p-4 text-gray-800"
            placeholder="https://..."
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
            keyboardType="url"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Submit Button */}
         <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-2xl mb-12 shadow-md ${
                submitting ? "bg-purple-400" : "bg-purple-600"
            }`}
        >
            {submitting ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-center font-bold text-lg">Save Exercise</Text>
            )}
        </TouchableOpacity>

      </KeyboardAwareScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.config.title}
        message={alert.config.message}
        buttons={alert.config.buttons}
        onClose={alert.hideAlert}
      />
    </SafeAreaView>
  );
}
