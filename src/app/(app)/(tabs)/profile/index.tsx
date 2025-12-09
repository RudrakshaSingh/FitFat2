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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";

const MAX_WEIGHT_KG = 200;
const MAX_WEIGHT_LBS = 440.9; // 200 kg in lbs
const MAX_HEIGHT_CM = 365.8; // 12 feet in cm
const MAX_HEIGHT_FEET = 12;
const MAX_AGE = 150;

export default function Profile() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.unsafeMetadata) {
      setName((user.unsafeMetadata.name as string) || "");
      setAge((user.unsafeMetadata.age as string) || "");
      setGender((user.unsafeMetadata.gender as "male" | "female") || null);
      setWeightKg((user.unsafeMetadata.weightKg as string) || "");
      setWeightLbs((user.unsafeMetadata.weightLbs as string) || "");
      setHeightCm((user.unsafeMetadata.heightCm as string) || "");
      setHeightFeet((user.unsafeMetadata.heightFeet as string) || "");
      setHeightInches((user.unsafeMetadata.heightInches as string) || "");
    }
  }, [user]);

  // Convert kg to lbs with limit check
  const handleWeightKgChange = (value: string) => {
    if (value && !isNaN(Number(value))) {
      const kg = Number(value);
      if (kg > MAX_WEIGHT_KG) {
        Alert.alert(
          "Limit Exceeded",
          `Maximum weight is ${MAX_WEIGHT_KG} kg (${MAX_WEIGHT_LBS.toFixed(
            1
          )} lbs)`
        );
        return;
      }
      setWeightKg(value);
      const lbs = (kg * 2.20462).toFixed(1);
      setWeightLbs(lbs);
    } else {
      setWeightKg(value);
      setWeightLbs("");
    }
  };

  // Convert lbs to kg with limit check
  const handleWeightLbsChange = (value: string) => {
    if (value && !isNaN(Number(value))) {
      const lbs = Number(value);
      if (lbs > MAX_WEIGHT_LBS) {
        Alert.alert(
          "Limit Exceeded",
          `Maximum weight is ${MAX_WEIGHT_KG} kg (${MAX_WEIGHT_LBS.toFixed(
            1
          )} lbs)`
        );
        return;
      }
      setWeightLbs(value);
      const kg = (lbs / 2.20462).toFixed(1);
      setWeightKg(kg);
    } else {
      setWeightLbs(value);
      setWeightKg("");
    }
  };

  // Convert cm to ft/in with limit check
  const handleHeightCmChange = (value: string) => {
    if (value && !isNaN(Number(value))) {
      const cm = Number(value);
      if (cm > MAX_HEIGHT_CM) {
        Alert.alert(
          "Limit Exceeded",
          `Maximum height is ${MAX_HEIGHT_FEET} feet (${MAX_HEIGHT_CM.toFixed(
            1
          )} cm)`
        );
        return;
      }
      setHeightCm(value);
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    } else {
      setHeightCm(value);
      setHeightFeet("");
      setHeightInches("");
    }
  };

  // Convert ft/in to cm with limit check - treating empty inches as 0
  const handleHeightFtInChange = (feet: string, inches: string) => {
    if (feet || inches) {
      const f = Number(feet) || 0;
      const i = Number(inches) || 0; // Treat empty as 0

      if (f > MAX_HEIGHT_FEET) {
        Alert.alert(
          "Limit Exceeded",
          `Maximum height is ${MAX_HEIGHT_FEET} feet (${MAX_HEIGHT_CM.toFixed(
            1
          )} cm)`
        );
        return;
      }

      const totalInches = f * 12 + i;
      const cm = totalInches * 2.54;

      if (cm > MAX_HEIGHT_CM) {
        Alert.alert(
          "Limit Exceeded",
          `Maximum height is ${MAX_HEIGHT_FEET} feet (${MAX_HEIGHT_CM.toFixed(
            1
          )} cm)`
        );
        return;
      }

      setHeightCm(cm.toFixed(1));
    } else {
      setHeightCm("");
    }
  };

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
    if (ageNum > MAX_AGE) {
      Alert.alert("Validation Error", `Maximum age is ${MAX_AGE} years`);
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
    if (kg > MAX_WEIGHT_KG) {
      Alert.alert(
        "Validation Error",
        `Maximum weight is ${MAX_WEIGHT_KG} kg (${MAX_WEIGHT_LBS.toFixed(
          1
        )} lbs)`
      );
      return false;
    }

    const cm = Number(heightCm);
    if (!heightCm.trim() || isNaN(cm) || cm <= 0) {
      Alert.alert("Validation Error", "Please enter a valid height");
      return false;
    }
    if (cm > MAX_HEIGHT_CM) {
      Alert.alert(
        "Validation Error",
        `Maximum height is ${MAX_HEIGHT_FEET} feet (${MAX_HEIGHT_CM.toFixed(
          1
        )} cm)`
      );
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
          heightInches: heightInches || "0", // Save as "0" if empty
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
      setWeightLbs((user.unsafeMetadata.weightLbs as string) || "");
      setHeightCm((user.unsafeMetadata.heightCm as string) || "");
      setHeightFeet((user.unsafeMetadata.heightFeet as string) || "");
      setHeightInches((user.unsafeMetadata.heightInches as string) || "");
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
      <KeyboardAwareScrollView
        className="flex-1"
        enableOnAndroid={true}
        extraScrollHeight={150} // lifts inputs above keyboard
        extraHeight={150} // perfect for nested views
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
      >
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

          {/* User Library Card */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/user-library")}
            className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex-row items-center border border-purple-100"
            activeOpacity={0.8}
          >
            <View className="bg-purple-100 p-3 rounded-full mr-4">
              <Ionicons name="library" size={24} color="#9333ea" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">User Library</Text>
              <Text className="text-gray-500 text-sm">
                Your custom exercises & saved activities
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

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
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-600">Age</Text>
                {isEditing && (
                  <Text className="text-xs text-gray-500">
                    Max: {MAX_AGE} years
                  </Text>
                )}
              </View>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="calendar-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={age}
                    onChangeText={(value) => {
                      const ageNum = Number(value);
                      if (value && !isNaN(ageNum) && ageNum > MAX_AGE) {
                        Alert.alert(
                          "Limit Exceeded",
                          `Maximum age is ${MAX_AGE} years`
                        );
                        return;
                      }
                      setAge(value);
                    }}
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
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-600">
                  Weight
                </Text>
                {isEditing && (
                  <Text className="text-xs text-gray-500">
                    Max: {MAX_WEIGHT_KG} kg / {MAX_WEIGHT_LBS.toFixed(0)} lbs
                  </Text>
                )}
              </View>
              {isEditing ? (
                <View className="flex-row gap-3">
                  {/* Weight in KG */}
                  <View className="flex-1">
                    <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <Ionicons
                        name="barbell-outline"
                        size={18}
                        color="#9333ea"
                      />
                      <TextInput
                        value={weightKg}
                        onChangeText={handleWeightKgChange}
                        placeholder="Weight"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        className="flex-1 ml-2 text-gray-800"
                      />
                      <Text className="text-gray-500 font-medium ml-1">kg</Text>
                    </View>
                  </View>

                  {/* Weight in LBS */}
                  <View className="flex-1">
                    <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <Ionicons
                        name="barbell-outline"
                        size={18}
                        color="#9333ea"
                      />
                      <TextInput
                        value={weightLbs}
                        onChangeText={handleWeightLbsChange}
                        placeholder="Weight"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        className="flex-1 ml-2 text-gray-800"
                      />
                      <Text className="text-gray-500 font-medium ml-1">
                        lbs
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {weightKg && weightLbs
                      ? `${weightKg} kg / ${weightLbs} lbs`
                      : "Not set"}
                  </Text>
                </View>
              )}
            </View>

            {/* Height */}
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-600">
                  Height
                </Text>
                {isEditing && (
                  <Text className="text-xs text-gray-500">
                    Max: {MAX_HEIGHT_FEET} ft / {MAX_HEIGHT_CM.toFixed(0)} cm
                  </Text>
                )}
              </View>
              {isEditing ? (
                <View>
                  {/* Height in CM */}
                  <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3">
                    <Ionicons name="resize-outline" size={18} color="#9333ea" />
                    <TextInput
                      value={heightCm}
                      onChangeText={handleHeightCmChange}
                      placeholder="Height"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                      className="flex-1 ml-2 text-gray-800"
                    />
                    <Text className="text-gray-500 font-medium ml-1">cm</Text>
                  </View>

                  {/* Height in FT/IN */}
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <Ionicons
                          name="resize-outline"
                          size={18}
                          color="#9333ea"
                        />
                        <TextInput
                          value={heightFeet}
                          onChangeText={(value) => {
                            setHeightFeet(value);
                            handleHeightFtInChange(value, heightInches);
                          }}
                          placeholder="Feet"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          maxLength={2}
                          className="flex-1 ml-2 text-gray-800"
                        />
                        <Text className="text-gray-500 font-medium ml-1">
                          ft
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <Ionicons
                          name="resize-outline"
                          size={18}
                          color="#9333ea"
                        />
                        <TextInput
                          value={heightInches}
                          onChangeText={(value) => {
                            setHeightInches(value);
                            handleHeightFtInChange(heightFeet, value);
                          }}
                          placeholder="Inches"
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                          maxLength={2}
                          className="flex-1 ml-2 text-gray-800"
                        />
                        <Text className="text-gray-500 font-medium ml-1">
                          in
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {heightCm && heightFeet && heightInches
                      ? `${heightCm} cm / ${heightFeet}'${heightInches}"`
                      : "Not set"}
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
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
