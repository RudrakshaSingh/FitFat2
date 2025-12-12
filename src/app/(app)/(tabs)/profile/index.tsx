import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
  const [goal, setGoal] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
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
      setGoal((user.unsafeMetadata.goal as string) || "");
      setWeightUnit((user.unsafeMetadata.weightUnit as "kg" | "lbs") || "kg");
      setHeightUnit((user.unsafeMetadata.heightUnit as "cm" | "ft") || "cm");
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
          goal: goal.trim(),
          weightUnit: weightUnit,
          heightUnit: heightUnit,
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
      setGoal((user.unsafeMetadata.goal as string) || "");
      setWeightUnit((user.unsafeMetadata.weightUnit as "kg" | "lbs") || "kg");
      setHeightUnit((user.unsafeMetadata.heightUnit as "cm" | "ft") || "cm");
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
        <View className="pb-8">
          {/* Header & Avatar Section */}
          <View className="px-6 pt-2 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-3xl font-bold text-gray-800">Profile</Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  className="bg-purple-100 rounded-full p-2.5"
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={20} color="#9333ea" />
                </TouchableOpacity>
              )}
            </View>

            <View className="items-center">
              <View className="shadow-lg shadow-purple-200">
                <View className="p-1 bg-white rounded-full">
                  <Image
                    source={{
                      uri: user?.imageUrl || "https://bg.adhoc.team/avatars/default.png",
                    }}
                    className="w-28 h-28 rounded-full"
                  />
                </View>
                {/* Status Badge */}
                <View className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
              </View>

              {!isEditing && (
                <View className="mt-4 items-center">
                  <Text className="text-2xl font-bold text-gray-800">
                    {name || user?.fullName || "Fitness Enthusiast"}
                  </Text>
                  <Text className="text-gray-500 font-medium">
                    {user?.primaryEmailAddress?.emailAddress}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* BMI Card */}
          {bmi && !isEditing && (
            <View className="px-6 mb-8">
              <LinearGradient
                colors={["#9333ea", "#7928ca"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-3xl p-6 shadow-xl shadow-purple-300"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-purple-100 text-sm font-semibold mb-1">
                      Your Body Mass Index
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-white text-5xl font-bold tracking-tighter">
                        {bmi}
                      </Text>
                      <Text className="text-purple-200 ml-2 font-medium">
                        BMI
                      </Text>
                    </View>
                    <View className="mt-2 bg-white/20 self-start px-3 py-1 rounded-full backdrop-blur-sm">
                      <Text className="text-white text-xs font-bold">
                        {Number(bmi) < 18.5
                          ? "Underweight"
                          : Number(bmi) < 25
                          ? "Healthy Weight"
                          : Number(bmi) < 30
                          ? "Overweight"
                          : "Obese"}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <Ionicons name="fitness" size={40} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}



          
          {/* Personal Information Card */}
          <View className="mx-6 bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-100 rounded-2xl p-3 mr-4">
                <Ionicons name="person" size={22} color="#9333ea" />
              </View>
              <Text className="text-xl font-bold text-gray-800">
                Personal Details
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

            {/* Goal */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Fitness Goal
              </Text>
              {isEditing ? (
                <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <Ionicons name="trophy-outline" size={20} color="#9333ea" />
                  <TextInput
                    value={goal}
                    onChangeText={setGoal}
                    placeholder="What is your main goal?"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-3 text-gray-800"
                  />
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {goal || "Not set"}
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
          <View className="mx-6 bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="bg-purple-100 rounded-2xl p-3 mr-4">
                <Ionicons name="body" size={22} color="#9333ea" />
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
                {/* Weight Unit Toggle */}
                {isEditing && (
                  <View className="flex-row items-center bg-gray-100 p-0.5 rounded-lg">
                    <TouchableOpacity
                      onPress={() => setWeightUnit("kg")}
                      className="px-3 py-1 rounded-md"
                      style={{
                        backgroundColor:
                          weightUnit === "kg" ? "#ffffff" : "transparent",
                        shadowColor:
                          weightUnit === "kg" ? "#000" : "transparent",
                        shadowOpacity: weightUnit === "kg" ? 0.05 : 0,
                        shadowRadius: 1,
                        elevation: weightUnit === "kg" ? 1 : 0,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: weightUnit === "kg" ? "#9333ea" : "#6b7280",
                        }}
                      >
                        KG
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setWeightUnit("lbs")}
                      className="px-3 py-1 rounded-md"
                      style={{
                        backgroundColor:
                          weightUnit === "lbs" ? "#ffffff" : "transparent",
                        shadowColor:
                          weightUnit === "lbs" ? "#000" : "transparent",
                        shadowOpacity: weightUnit === "lbs" ? 0.05 : 0,
                        shadowRadius: 1,
                        elevation: weightUnit === "lbs" ? 1 : 0,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: weightUnit === "lbs" ? "#9333ea" : "#6b7280",
                        }}
                      >
                        LBS
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isEditing && (
                  <Text className="text-xs text-gray-500 ml-2">
                    Max: {MAX_WEIGHT_KG} kg / {MAX_WEIGHT_LBS.toFixed(0)} lbs
                  </Text>
                )}
              </View>
              {isEditing ? (
                <View>
                  {weightUnit === "kg" ? (
                    /* Weight in KG */
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
                  ) : (
                    /* Weight in LBS */
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
                  )}
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {weightKg && weightLbs
                      ? weightUnit === "kg"
                        ? `${weightKg} kg`
                        : `${weightLbs} lbs`
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
                {/* Height Unit Toggle */}
                {isEditing && (
                  <View className="flex-row items-center bg-gray-100 p-0.5 rounded-lg">
                    <TouchableOpacity
                      onPress={() => setHeightUnit("cm")}
                      className="px-3 py-1 rounded-md"
                      style={{
                        backgroundColor:
                          heightUnit === "cm" ? "#ffffff" : "transparent",
                        shadowColor:
                          heightUnit === "cm" ? "#000" : "transparent",
                        shadowOpacity: heightUnit === "cm" ? 0.05 : 0,
                        shadowRadius: 1,
                        elevation: heightUnit === "cm" ? 1 : 0,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: heightUnit === "cm" ? "#9333ea" : "#6b7280",
                        }}
                      >
                        CM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setHeightUnit("ft")}
                      className="px-3 py-1 rounded-md"
                      style={{
                        backgroundColor:
                          heightUnit === "ft" ? "#ffffff" : "transparent",
                        shadowColor:
                          heightUnit === "ft" ? "#000" : "transparent",
                        shadowOpacity: heightUnit === "ft" ? 0.05 : 0,
                        shadowRadius: 1,
                        elevation: heightUnit === "ft" ? 1 : 0,
                      }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{
                          color: heightUnit === "ft" ? "#9333ea" : "#6b7280",
                        }}
                      >
                        FT
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isEditing && (
                  <Text className="text-xs text-gray-500 ml-2">
                    Max: {MAX_HEIGHT_FEET} ft / {MAX_HEIGHT_CM.toFixed(0)} cm
                  </Text>
                )}
              </View>
              {isEditing ? (
                <View>
                  {heightUnit === "cm" ? (
                    /* Height in CM */
                    <View className="flex-row items-center bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <Ionicons
                        name="resize-outline"
                        size={18}
                        color="#9333ea"
                      />
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
                  ) : (
                    /* Height in FT/IN */
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
                  )}
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-lg text-gray-800">
                    {heightCm && heightFeet && heightInches
                      ? heightUnit === "cm"
                        ? `${heightCm} cm`
                        : `${heightFeet}'${heightInches}"`
                      : "Not set"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing ? (
            <View className="mx-6 flex-row gap-3 mb-8">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 bg-gray-100 rounded-2xl p-4 border border-gray-200"
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
                className="flex-1 bg-purple-600 rounded-2xl p-4 shadow-lg shadow-purple-200"
                activeOpacity={0.8}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Save
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSignOut}
              className="mx-6 bg-red-50 rounded-2xl p-4 mb-8 border border-red-100"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                <Text className="text-red-600 font-bold text-lg ml-2">
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
