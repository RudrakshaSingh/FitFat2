import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.unsafeMetadata) {
      setName((user.unsafeMetadata.name as string) || "");
      setAge((user.unsafeMetadata.age as string) || "");
      setGender((user.unsafeMetadata.gender as "male" | "female") || null);
      setWeightKg((user.unsafeMetadata.weightKg as string) || "");
      setHeightCm((user.unsafeMetadata.heightCm as string) || "");
    }
  }, [user]);

  const validateFields = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Name cannot be empty");
      return false;
    }

    const ageNum = Number(age);
    if (!age.trim() || isNaN(ageNum) || ageNum <= 0) {
      Alert.alert("Validation Error", "Please enter a valid age");
      return false;
    }

    if (!gender) {
      Alert.alert("Validation Error", "Please select a gender");
      return false;
    }

    const kg = Number(weightKg);
    if (!weightKg.trim() || isNaN(kg) || kg <= 0) {
      Alert.alert("Validation Error", "Please enter a valid weight");
      return false;
    }

    const cm = Number(heightCm);
    if (!heightCm.trim() || isNaN(cm) || cm <= 0) {
      Alert.alert("Validation Error", "Please enter a valid height");
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSaving(true);
    try {
      // Convert kg to lbs and cm to feet/inches for storage
      const weightLbs = (Number(weightKg) / 0.453592).toFixed(1);
      const totalInches = Number(heightCm) / 2.54;
      const heightFeet = Math.floor(totalInches / 12).toString();
      const heightInches = Math.round(totalInches % 12).toString();

      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          name: name.trim(),
          age: age.trim(),
          gender: gender,
          weightKg: weightKg,
          weightLbs: weightLbs,
          heightCm: heightCm,
          heightFeet: heightFeet,
          heightInches: heightInches,
        },
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (user?.unsafeMetadata) {
      setName((user.unsafeMetadata.name as string) || "");
      setAge((user.unsafeMetadata.age as string) || "");
      setGender((user.unsafeMetadata.gender as "male" | "female") || null);
      setWeightKg((user.unsafeMetadata.weightKg as string) || "");
      setHeightCm((user.unsafeMetadata.heightCm as string) || "");
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ],
      { cancelable: true }
    );
  };

  const calculateBMI = () => {
    const weight = Number(weightKg);
    const height = Number(heightCm) / 100; // convert to meters
    if (weight > 0 && height > 0) {
      return (weight / (height * height)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <SafeAreaView className="flex flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-3xl font-bold text-gray-800">Profile</Text>
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-purple-600 rounded-xl px-4 py-2 flex-row items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text className="text-white font-semibold ml-2">Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* BMI Card */}
          {bmi && !isEditing && (
            <View className="bg-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-sm font-semibold mb-1 opacity-90">
                    Your BMI
                  </Text>
                  <Text className="text-white text-5xl font-bold">{bmi}</Text>
                </View>
                <View className="bg-white rounded-full p-4">
                  <Ionicons name="fitness" size={32} color="#9333ea" />
                </View>
              </View>
            </View>
          )}

          {/* Personal Information Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-5">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="person" size={20} color="#9333ea" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                Personal Information
              </Text>
            </View>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Full Name
              </Text>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="person-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-3 text-gray-800"
                  />
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {name || "Not set"}
                  </Text>
                </View>
              )}
            </View>

            {/* Age */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Age
              </Text>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="calendar-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    maxLength={3}
                    className="flex-1 ml-3 text-gray-800"
                  />
                  <Text className="text-gray-500 font-medium">years</Text>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {age ? `${age} years` : "Not set"}
                  </Text>
                </View>
              )}
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Gender
              </Text>
              {isEditing ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setGender("male")}
                    className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                      gender === "male"
                        ? "bg-purple-50 border-purple-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="male"
                      size={24}
                      color={gender === "male" ? "#9333ea" : "#6b7280"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        gender === "male" ? "text-purple-600" : "text-gray-600"
                      }`}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGender("female")}
                    className={`flex-1 flex-row items-center justify-center p-4 rounded-xl border-2 ${
                      gender === "female"
                        ? "bg-purple-50 border-purple-600"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="female"
                      size={24}
                      color={gender === "female" ? "#9333ea" : "#6b7280"}
                    />
                    <Text
                      className={`ml-2 font-semibold ${
                        gender === "female"
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800 capitalize">
                    {gender || "Not set"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Body Measurements Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-5">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="body" size={20} color="#9333ea" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                Body Measurements
              </Text>
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Weight
              </Text>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="barbell-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    placeholder="Enter weight"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 ml-3 text-gray-800"
                  />
                  <Text className="text-gray-500 font-bold">kg</Text>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {weightKg ? `${weightKg} kg` : "Not set"}
                  </Text>
                </View>
              )}
            </View>

            {/* Height */}
            <View>
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Height
              </Text>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="resize-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    placeholder="Enter height"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 ml-3 text-gray-800"
                  />
                  <Text className="text-gray-500 font-bold">cm</Text>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {heightCm ? `${heightCm} cm` : "Not set"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-200 rounded-2xl p-5"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="close" size={20} color="#374151" />
                  <Text className="text-gray-700 font-bold text-lg ml-2">
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="flex-1 bg-purple-600 rounded-2xl p-5 shadow-lg"
                activeOpacity={0.8}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Save Changes
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-red-600 rounded-2xl p-5 shadow-sm mb-4"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Sign Out
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
