import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert("Error", "Please enter your name");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const ageNum = Number(age);
      if (!age.trim() || isNaN(ageNum) || ageNum <= 0) {
        Alert.alert("Error", "Please enter a valid age");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!gender) {
        Alert.alert("Error", "Please select your gender");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      const kg = Number(weightKg);
      if (!weightKg.trim() || isNaN(kg) || kg <= 0) {
        Alert.alert("Error", "Please enter a valid weight");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      const cm = Number(heightCm);
      if (!heightCm.trim() || isNaN(cm) || cm <= 0) {
        Alert.alert("Error", "Please enter a valid height");
        return;
      }
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Convert kg to lbs and cm to feet/inches for storage
      const weightLbs = (Number(weightKg) / 0.453592).toFixed(1);
      const totalInches = Number(heightCm) / 2.54;
      const heightFeet = Math.floor(totalInches / 12).toString();
      const heightInches = Math.round(totalInches % 12).toString();

      await user?.update({
        unsafeMetadata: {
          name: name.trim(),
          age: age.trim(),
          gender: gender,
          weightLbs: weightLbs,
          weightKg: weightKg,
          heightFeet: heightFeet,
          heightInches: heightInches,
          heightCm: heightCm,
          onboardingCompleted: true,
        },
      });

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View className="flex-row gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((s) => (
        <View
          key={s}
          className={`flex-1 h-2 rounded-full ${
            s <= step ? "bg-purple-600" : "bg-gray-200"
          }`}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-6">
          {/* Back Button */}
          {step > 1 && (
            <TouchableOpacity
              onPress={handleBack}
              className="absolute top-6 left-6 z-10 bg-white rounded-full p-2 shadow-sm"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#9333ea" />
            </TouchableOpacity>
          )}

          {/* Progress Bar */}
          <View className="mt-12">{renderProgressBar()}</View>

          <View className="flex-1 justify-center">
            {/* Step 1: Name */}
            {step === 1 && (
              <View>
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                  <Ionicons name="person" size={40} color="#9333ea" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                  What's your name?
                </Text>
                <Text className="text-lg text-gray-600 text-center mb-8">
                  Let's get to know you better
                </Text>
                <View className="flex-row items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <Ionicons name="person-outline" size={24} color="#9333ea" />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 ml-3 text-gray-800 text-lg"
                    autoCapitalize="words"
                    autoFocus
                  />
                </View>
              </View>
            )}

            {/* Step 2: Age */}
            {step === 2 && (
              <View>
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                  <Ionicons name="calendar" size={40} color="#9333ea" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                  How old are you?
                </Text>
                <Text className="text-lg text-gray-600 text-center mb-8">
                  This helps us personalize your experience
                </Text>
                <View className="flex-row items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <Ionicons name="calendar-outline" size={24} color="#9333ea" />
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    className="flex-1 ml-3 text-gray-800 text-lg"
                    maxLength={3}
                    autoFocus
                  />
                </View>
              </View>
            )}

            {/* Step 3: Gender */}
            {step === 3 && (
              <View>
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                  <Ionicons name="people" size={40} color="#9333ea" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                  What's your gender?
                </Text>
                <Text className="text-lg text-gray-600 text-center mb-8">
                  This helps us tailor your fitness plan
                </Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    onPress={() => setGender("male")}
                    className={`flex-1 items-center p-6 rounded-2xl border-2 ${
                      gender === "male"
                        ? "bg-purple-50 border-purple-600"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="male"
                      size={48}
                      color={gender === "male" ? "#9333ea" : "#6b7280"}
                    />
                    <Text
                      className={`mt-3 font-bold text-lg ${
                        gender === "male" ? "text-purple-600" : "text-gray-600"
                      }`}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setGender("female")}
                    className={`flex-1 items-center p-6 rounded-2xl border-2 ${
                      gender === "female"
                        ? "bg-purple-50 border-purple-600"
                        : "bg-white border-gray-200"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="female"
                      size={48}
                      color={gender === "female" ? "#9333ea" : "#6b7280"}
                    />
                    <Text
                      className={`mt-3 font-bold text-lg ${
                        gender === "female"
                          ? "text-purple-600"
                          : "text-gray-600"
                      }`}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 4: Weight */}
            {step === 4 && (
              <View>
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                  <Ionicons name="fitness" size={40} color="#9333ea" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                  What's your weight?
                </Text>
                <Text className="text-lg text-gray-600 text-center mb-8">
                  Enter your weight in kilograms
                </Text>

                <View className="flex-row items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <Ionicons name="barbell-outline" size={24} color="#9333ea" />
                  <TextInput
                    value={weightKg}
                    onChangeText={setWeightKg}
                    placeholder="Enter weight"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 ml-3 text-gray-800 text-lg"
                    autoFocus
                  />
                  <Text className="text-gray-500 font-bold text-lg">kg</Text>
                </View>
              </View>
            )}

            {/* Step 5: Height */}
            {step === 5 && (
              <View>
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                  <Ionicons name="resize" size={40} color="#9333ea" />
                </View>
                <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                  What's your height?
                </Text>
                <Text className="text-lg text-gray-600 text-center mb-8">
                  Enter your height in centimeters
                </Text>

                <View className="flex-row items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <Ionicons name="resize-outline" size={24} color="#9333ea" />
                  <TextInput
                    value={heightCm}
                    onChangeText={setHeightCm}
                    placeholder="Enter height"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    className="flex-1 ml-3 text-gray-800 text-lg"
                    autoFocus
                  />
                  <Text className="text-gray-500 font-bold">cm</Text>
                </View>
              </View>
            )}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            className="bg-purple-600 rounded-2xl p-5 shadow-lg mb-4"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center justify-center">
                <Text className="text-white font-bold text-lg mr-2">
                  {step === 5 ? "Complete" : "Continue"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
