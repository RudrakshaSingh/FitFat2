import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const MAX_WEIGHT_KG = 200;
const MAX_WEIGHT_LBS = 440.9; // 200 kg in lbs
const MAX_HEIGHT_CM = 365.8; // 12 feet in cm
const MAX_HEIGHT_FEET = 12;
const MAX_AGE = 150;

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
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft">("cm");
  const [goal, setGoal] = useState("");

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
      if (ageNum > MAX_AGE) {
        Alert.alert("Error", `Maximum age is ${MAX_AGE} years`);
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
      if (kg > MAX_WEIGHT_KG) {
        Alert.alert(
          "Error",
          `Maximum weight is ${MAX_WEIGHT_KG} kg (${MAX_WEIGHT_LBS.toFixed(
            1
          )} lbs)`
        );
        return;
      }
      setStep(5);
    } else if (step === 5) {
      const cm = Number(heightCm);
      if (!heightCm.trim() || isNaN(cm) || cm <= 0) {
        Alert.alert("Error", "Please enter a valid height");
        return;
      }
      if (cm > MAX_HEIGHT_CM) {
        Alert.alert(
          "Error",
          `Maximum height is ${MAX_HEIGHT_FEET} feet (${MAX_HEIGHT_CM.toFixed(
            1
          )} cm)`
        );
        return;
      }
      setStep(6);
    } else if (step === 6) {
      if (!goal.trim()) {
        Alert.alert("Error", "Please share your goal with us");
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
      await user?.update({
        unsafeMetadata: {
          name: name.trim(),
          age: age.trim(),
          gender: gender,
          weightLbs: weightLbs,
          weightKg: weightKg,
          heightFeet: heightFeet,
          heightInches: heightInches || "0", // Save as "0" if empty
          heightCm: heightCm,
          weightUnit: weightUnit,
          heightUnit: heightUnit,
          goal: goal,
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
      {[1, 2, 3, 4, 5, 6].map((s) => (
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
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 24,
        }}
        enableOnAndroid={true}
        extraScrollHeight={20} // Reduced from 150
        extraHeight={20} // Reduced from 150
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        {step > 1 && (
          <TouchableOpacity
            onPress={handleBack}
            className="mb-4 bg-white rounded-full p-3 shadow-sm self-start"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#9333ea" />
          </TouchableOpacity>
        )}

        {/* Progress Bar */}
        <View className={step === 1 ? "mt-0" : ""}>{renderProgressBar()}</View>

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
              <Text className="text-lg text-gray-600 text-center mb-6">
                This helps us personalize your experience
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-4">
                Max: {MAX_AGE} years
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <Ionicons name="calendar-outline" size={24} color="#9333ea" />
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
                  className="flex-1 ml-3 text-gray-800 text-lg"
                  maxLength={3}
                />
                <Text className="text-gray-500 font-bold text-lg">years</Text>
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
                      gender === "female" ? "text-purple-600" : "text-gray-600"
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
              <Text className="text-lg text-gray-600 text-center mb-4">
                Enter in kg or lbs
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-6">
                Max: {MAX_WEIGHT_KG} kg / {MAX_WEIGHT_LBS.toFixed(0)} lbs
              </Text>


              {/* Weight Unit Toggle */}
              <View className="flex-row items-center justify-center mb-6 bg-gray-100 p-1 rounded-xl self-center">
                <TouchableOpacity
                  onPress={() => setWeightUnit("kg")}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: weightUnit === "kg" ? "#ffffff" : "transparent",
                    shadowColor: weightUnit === "kg" ? "#000" : "transparent",
                    shadowOpacity: weightUnit === "kg" ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: weightUnit === "kg" ? 2 : 0,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: weightUnit === "kg" ? "#9333ea" : "#6b7280" }}
                  >
                    KG
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWeightUnit("lbs")}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: weightUnit === "lbs" ? "#ffffff" : "transparent",
                    shadowColor: weightUnit === "lbs" ? "#000" : "transparent",
                    shadowOpacity: weightUnit === "lbs" ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: weightUnit === "lbs" ? 2 : 0,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: weightUnit === "lbs" ? "#9333ea" : "#6b7280" }}
                  >
                    LBS
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                {weightUnit === "kg" ? (
                  /* Weight in KG */
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Kilograms
                    </Text>
                    <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                      <Ionicons
                        name="barbell-outline"
                        size={20}
                        color="#9333ea"
                      />
                      <TextInput
                        value={weightKg}
                        onChangeText={handleWeightKgChange}
                        placeholder="Weight"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        className="flex-1 ml-2 text-gray-800 text-base"
                      />
                      <Text className="text-gray-500 font-medium ml-1">kg</Text>
                    </View>
                  </View>
                ) : (
                  /* Weight in LBS */
                  <View>
                    <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                      Pounds
                    </Text>
                    <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                      <Ionicons
                        name="barbell-outline"
                        size={20}
                        color="#9333ea"
                      />
                      <TextInput
                        value={weightLbs}
                        onChangeText={handleWeightLbsChange}
                        placeholder="Weight"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                        className="flex-1 ml-2 text-gray-800 text-base"
                      />
                      <Text className="text-gray-500 font-medium ml-1">lbs</Text>
                    </View>
                  </View>
                )}
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
              <Text className="text-lg text-gray-600 text-center mb-4">
                Enter in cm or ft/in
              </Text>
              <Text className="text-sm text-gray-500 text-center mb-6">
                Max: {MAX_HEIGHT_FEET} ft / {MAX_HEIGHT_CM.toFixed(0)} cm
              </Text>

              {/* Height Unit Toggle */}
              <View className="flex-row items-center justify-center mb-6 bg-gray-100 p-1 rounded-xl self-center">
                <TouchableOpacity
                  onPress={() => setHeightUnit("cm")}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: heightUnit === "cm" ? "#ffffff" : "transparent",
                    shadowColor: heightUnit === "cm" ? "#000" : "transparent",
                    shadowOpacity: heightUnit === "cm" ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: heightUnit === "cm" ? 2 : 0,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: heightUnit === "cm" ? "#9333ea" : "#6b7280" }}
                  >
                    CM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setHeightUnit("ft")}
                  className="px-6 py-2 rounded-lg"
                  style={{
                    backgroundColor: heightUnit === "ft" ? "#ffffff" : "transparent",
                    shadowColor: heightUnit === "ft" ? "#000" : "transparent",
                    shadowOpacity: heightUnit === "ft" ? 0.1 : 0,
                    shadowRadius: 2,
                    elevation: heightUnit === "ft" ? 2 : 0,
                  }}
                >
                  <Text
                    className="font-semibold"
                    style={{ color: heightUnit === "ft" ? "#9333ea" : "#6b7280" }}
                  >
                    FT/IN
                  </Text>
                </TouchableOpacity>
              </View>

              {heightUnit === "cm" ? (
                /* Height in CM */
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Centimeters
                  </Text>
                  <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <Ionicons name="resize-outline" size={20} color="#9333ea" />
                    <TextInput
                      value={heightCm}
                      onChangeText={handleHeightCmChange}
                      placeholder="Height"
                      placeholderTextColor="#9ca3af"
                      keyboardType="decimal-pad"
                      className="flex-1 ml-2 text-gray-800 text-base"
                    />
                    <Text className="text-gray-500 font-medium ml-1">cm</Text>
                  </View>
                </View>
              ) : (
                /* Height in FT/IN */
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Feet & Inches
                  </Text>
                  <View className="flex-row gap-4">
                    {/* Feet */}
                    <View className="flex-1">
                      <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                        <Ionicons
                          name="resize-outline"
                          size={20}
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
                          className="flex-1 ml-2 text-gray-800 text-base"
                        />
                        <Text className="text-gray-500 font-medium ml-1">ft</Text>
                      </View>
                    </View>

                    {/* Inches */}
                    <View className="flex-1">
                      <View className="flex-row items-center bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                        <Ionicons
                          name="resize-outline"
                          size={20}
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
                          className="flex-1 ml-2 text-gray-800 text-base"
                        />
                        <Text className="text-gray-500 font-medium ml-1">in</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Step 6: Goal */}
          {step === 6 && (
            <View>
              <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-6 self-center">
                <Ionicons name="flag" size={40} color="#9333ea" />
              </View>
              <Text className="text-4xl font-bold text-gray-800 text-center mb-3">
                What's your goal?
              </Text>
              <Text className="text-lg text-gray-600 text-center mb-6">
                Tell us what you want to achieve
              </Text>

              {/* Goal Input */}
              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  placeholder="e.g. I want to lose weight..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  className="text-gray-800 text-lg h-24"
                  textAlignVertical="top"
                />
              </View>

              {/* Suggestions */}
              <Text className="text-sm font-semibold text-gray-700 mb-3 ml-1">
                Suggestions
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Lose 5kg in one month",
                  "Gain muscle mass",
                  "Build a better upper body",
                  "Improve execution consistency",
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setGoal(suggestion)}
                    className="bg-purple-50 rounded-full px-4 py-2 border border-purple-100"
                    activeOpacity={0.7}
                  >
                    <Text className="text-purple-700 font-medium">
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note */}
              <View className="mt-8 flex-row items-start bg-blue-50 p-4 rounded-xl">
                <Ionicons
                  name="information-circle"
                  size={24}
                  color="#3b82f6"
                  style={{ marginTop: -2 }}
                />
                <Text className="text-blue-700 ml-3 flex-1 text-sm leading-5">
                  This information is necessary to get personalized coaching
                  tailored to your specific needs.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading}
          className="bg-purple-600 rounded-2xl p-5 shadow-lg mb-4 mt-8"
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center justify-center">
              <Text className="text-white font-bold text-lg mr-2">
                {step === 6 ? "Complete" : "Continue"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
