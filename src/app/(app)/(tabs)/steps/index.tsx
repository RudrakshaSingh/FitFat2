import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";
import { useStepStore } from "../../../../../store/step-store";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import {
  startStepTracking,
  stopStepTracking,
  resetStepTracking,
} from "../../../../services/step-tracking-service";
import CustomAlert from "@/app/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export default function StepsScreen() {
  const {
    currentSteps,
    dailyGoal,
    isTracking,
    setCurrentSteps,
    addSteps,
    setDailyGoal,
    checkAndResetForNewDay,
    resetSteps,
  } = useStepStore();

  const alert = useCustomAlert();

  const [isPedometerAvailable, setIsPedometerAvailable] = useState<
    "checking" | "available" | "unavailable"
  >("checking");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal.toString());

  // Track the baseline step count when subscription starts
  const baselineStepsRef = React.useRef<number | null>(null);
  const subscriptionRef = React.useRef<{ remove: () => void } | null>(null);

  // Check for new day on mount
  useEffect(() => {
    checkAndResetForNewDay();
  }, []);

  // Check pedometer availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const perm = await Pedometer.requestPermissionsAsync();
        if (!perm.granted) {
          console.log("Pedometer permission denied");
          setIsPedometerAvailable("unavailable");
          return;
        }

        const isAvailable = await Pedometer.isAvailableAsync();
        console.log("Pedometer available:", isAvailable);
        setIsPedometerAvailable(isAvailable ? "available" : "unavailable");
      } catch (err) {
        console.error("Error checking pedometer:", err);
        setIsPedometerAvailable("unavailable");
      }
    };

    checkAvailability();
  }, []);

  // Subscribe/unsubscribe to pedometer based on isTracking state
  useEffect(() => {
    if (!isTracking) {
      // Clean up subscription if tracking is stopped
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      baselineStepsRef.current = null;
      return;
    }

    const subscribe = async () => {
      if (isPedometerAvailable !== "available") return;

      try {
        // Try to get today's step count (works on iOS)
        if (Platform.OS === "ios") {
          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);

          try {
            const pastStepCount = await Pedometer.getStepCountAsync(start, end);
            if (pastStepCount) {
              console.log("iOS past steps:", pastStepCount.steps);
              setCurrentSteps(pastStepCount.steps);
            }
          } catch (error) {
            console.log("Error getting past step count:", error);
          }
        }

        // Subscribe to real-time updates
        console.log("Subscribing to step count...");
        subscriptionRef.current = Pedometer.watchStepCount((result) => {
          console.log("Step update received:", result.steps);

          // First update - set baseline
          if (baselineStepsRef.current === null) {
            baselineStepsRef.current = result.steps;
            console.log("Baseline set to:", result.steps);
            return;
          }

          // Calculate new steps since baseline
          const newSteps = result.steps - baselineStepsRef.current;
          if (newSteps > 0) {
            console.log("Adding steps:", newSteps);
            // Update baseline and add the difference
            baselineStepsRef.current = result.steps;
            addSteps(newSteps);
          }
        });
      } catch (err) {
        console.error("Error subscribing to pedometer:", err);
      }
    };

    subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      baselineStepsRef.current = null;
    };
  }, [isTracking, isPedometerAvailable]);

  const handleToggleTracking = async () => {
    if (isTracking) {
      await stopStepTracking();
    } else {
      await startStepTracking();
    }
  };

  const handleReset = () => {
    alert.showAlert(
      "Reset Steps",
      "Are you sure you want to reset your step count to 0?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetStepTracking();
            baselineStepsRef.current = null;
          },
        },
      ]
    );
  };

  const progress = Math.min(currentSteps / dailyGoal, 1);
  const progressPercent = Math.round(progress * 100);

  // Calorie calculation (rough estimate: 0.04 calories per step)
  const caloriesBurned = Math.round(currentSteps * 0.04);

  // Distance calculation (average stride length: 0.762 meters)
  const distanceKm = ((currentSteps * 0.762) / 1000).toFixed(2);

  // SVG Circle dimensions
  const size = 280;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInput);
    if (isNaN(newGoal) || newGoal < 100) {
      alert.showAlert("Invalid Goal", "Please enter a goal of at least 100 steps");
      return;
    }
    if (newGoal > 100000) {
      alert.showAlert("Invalid Goal", "Maximum goal is 100,000 steps");
      return;
    }
    setDailyGoal(newGoal);
    setShowGoalModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 pt-4 pb-10">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800">Steps</Text>
            <Text className="text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Main Progress Circle */}
          <View className="items-center mb-10">
            <View className="relative">
              <Svg width={size} height={size}>
                <Defs>
                  <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#9333ea" />
                    <Stop offset="100%" stopColor="#c084fc" />
                  </SvgGradient>
                </Defs>
                {/* Background Circle */}
                <Circle
                  stroke="#f3f4f6"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                />
                {/* Progress Circle */}
                <Circle
                  stroke="url(#progressGradient)"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
              {/* Center Content */}
              <View className="absolute inset-0 items-center justify-center">
                <Ionicons
                  name="footsteps"
                  size={32}
                  color="#9333ea"
                  style={{ marginBottom: 8 }}
                />
                <Text className="text-5xl font-bold text-gray-800">
                  {currentSteps.toLocaleString()}
                </Text>
                <Text className="text-gray-500 mt-1">
                  of {dailyGoal.toLocaleString()} steps
                </Text>
                <View className="bg-purple-100 px-4 py-1.5 rounded-full mt-3">
                  <Text className="text-purple-700 font-bold">
                    {progressPercent}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-row items-center justify-center gap-6 mb-8">
            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleReset}
              className="bg-white p-4 rounded-full shadow-sm border border-gray-100"
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={24} color="#ef4444" />
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity
              onPress={handleToggleTracking}
              disabled={isPedometerAvailable !== "available"}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isTracking ? ["#ef4444", "#dc2626"] : ["#9333ea", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6 "
                style={{
                    shadowColor: isTracking ? "#ef4444" : "#9333ea",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                    borderRadius: 50,
                }}
              >
                <Ionicons
                  name={isTracking ? "pause" : "play"}
                  size={32}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Goal Button */}
            <TouchableOpacity
              onPress={() => {
                setGoalInput(dailyGoal.toString());
                setShowGoalModal(true);
              }}
              className="bg-white p-4 rounded-full shadow-sm border border-gray-100"
              activeOpacity={0.8}
            >
              <Ionicons name="flag" size={24} color="#9333ea" />
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View className="items-center mb-8">
            <View className={`px-4 py-2 rounded-full ${
                isTracking ? "bg-green-100" : "bg-gray-100"
            }`}>
              <Text className={`font-medium ${
                 isTracking ? "text-green-700" : "text-gray-500"
              }`}>
                {isPedometerAvailable === "checking"
                  ? "Checking sensor..."
                  : isPedometerAvailable === "unavailable"
                  ? "Pedometer not available"
                  : isTracking
                  ? "● Tracking Active"
                  : "Tracking Paused"}
              </Text>
            </View>
          </View>

          {/* Error State */}
          {isPedometerAvailable === "unavailable" && (
            <View className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-100">
              <Text className="text-red-600 text-center">
                Pedometer not available. Please ensure activity permissions are granted.
              </Text>
            </View>
          )}

          {/* Stats Cards */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="bg-orange-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Ionicons name="flame" size={24} color="#f97316" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {caloriesBurned}
              </Text>
              <Text className="text-gray-500 text-sm">Calories</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <View className="bg-blue-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
                <Ionicons name="map" size={24} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-gray-800">
                {distanceKm}
              </Text>
              <Text className="text-gray-500 text-sm">Kilometers</Text>
            </View>
          </View>

          {/* Goal Card */}
          <LinearGradient
            colors={["#9333ea", "#c084fc"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 mb-6"
            style={{borderRadius: 20}}
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-xl p-3 mr-4">
                <Ionicons name="trophy" size={28} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">
                  {progress >= 1
                    ? "🎉 Goal Achieved!"
                    : progress >= 0.75
                    ? "Almost there!"
                    : progress >= 0.5
                    ? "Halfway done!"
                    : "Keep moving!"}
                </Text>
                <Text className="text-purple-100 mt-1">
                  {progress >= 1
                    ? "Great job completing your daily goal!"
                    : `${(dailyGoal - currentSteps).toLocaleString()} steps to go`}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Goal Setting Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Set Daily Goal
            </Text>
            <View className="flex-row items-center bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
              <Ionicons name="flag" size={20} color="#9333ea" />
              <TextInput
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder="Enter step goal"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="flex-1 ml-3 text-gray-800 text-lg"
              />
              <Text className="text-gray-500">steps</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                className="flex-1 bg-gray-100 rounded-xl py-4"
                activeOpacity={0.8}
              >
                <Text className="text-gray-600 font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveGoal}
                activeOpacity={0.8}
                className="flex-1 rounded-xl overflow-hidden"
              >
                 <LinearGradient
                    colors={["#9333ea", "#7c3aed"]}
                    className="py-4 items-center"
                 >
                    <Text className="text-white font-semibold text-center">
                    Save
                    </Text>
                 </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
