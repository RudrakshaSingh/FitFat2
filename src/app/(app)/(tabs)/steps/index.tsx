import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Pedometer } from "expo-sensors";
import { LinearGradient } from "expo-linear-gradient";
import { useStepStore } from "../../../../../store/step-store";
import Svg, { Circle } from "react-native-svg";
import {
  startStepTracking,
  stopStepTracking,
  updateTrackingNotification,
  setupAppStateHandler,
  cleanupAppStateHandler,
} from "../../../../services/step-tracking-service";

export default function StepsScreen() {
  const {
    currentSteps,
    dailyGoal,
    isTracking,
    setCurrentSteps,
    addSteps,
    setDailyGoal,
    checkAndResetForNewDay,
    toggleTracking,
  } = useStepStore();

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
    setupAppStateHandler();

    return () => {
      cleanupAppStateHandler();
    };
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

            // Update notification with new step count
            const newTotal = useStepStore.getState().currentSteps;
            updateTrackingNotification(newTotal);
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
      Alert.alert("Invalid Goal", "Please enter a goal of at least 100 steps");
      return;
    }
    if (newGoal > 100000) {
      Alert.alert("Invalid Goal", "Maximum goal is 100,000 steps");
      return;
    }
    setDailyGoal(newGoal);
    setShowGoalModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-6 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-3xl font-bold text-gray-800">Steps</Text>
            <Text className="text-gray-500 mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setGoalInput(dailyGoal.toString());
              setShowGoalModal(true);
            }}
            className="bg-purple-100 rounded-full p-3"
            activeOpacity={0.8}
          >
            <Ionicons name="settings-outline" size={22} color="#9333ea" />
          </TouchableOpacity>
        </View>

        {/* Main Progress Circle */}
        <View className="items-center mb-6">
          <View className="relative">
            <Svg width={size} height={size}>
              {/* Background Circle */}
              <Circle
                stroke="#e5e7eb"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              {/* Progress Circle */}
              <Circle
                stroke="#9333ea"
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

        {/* Play/Pause Control */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={handleToggleTracking}
            className={`rounded-full p-4 shadow-lg ${
              isTracking ? "bg-red-500" : "bg-purple-500"
            }`}
            activeOpacity={0.8}
            disabled={isPedometerAvailable !== "available"}
          >
            <Ionicons
              name={isTracking ? "pause" : "play"}
              size={30}
              color="white"
            />
          </TouchableOpacity>
          <Text className="text-gray-600 mt-3 font-medium">
            {isPedometerAvailable === "checking"
              ? "Checking sensor..."
              : isPedometerAvailable === "unavailable"
              ? "Pedometer not available"
              : isTracking
              ? "Tracking Active - Tap to Pause"
              : "Tap to Start Tracking"}
          </Text>
        </View>

        {/* Pedometer Status */}
        {isPedometerAvailable === "unavailable" && (
          <View className="bg-red-50 rounded-2xl p-4 mb-4 border border-red-200">
            <Text className="text-red-700 text-center">
              Pedometer not available on this device. Please ensure you have granted activity permissions.
            </Text>
          </View>
        )}

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          {/* Calories Card */}
          <View className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <View className="bg-orange-100 w-12 h-12 rounded-xl items-center justify-center mb-3">
              <Ionicons name="flame" size={24} color="#f97316" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              {caloriesBurned}
            </Text>
            <Text className="text-gray-500 text-sm">Calories</Text>
          </View>

          {/* Distance Card */}
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

        {/* Motivational Card */}
        <LinearGradient
          colors={["#9333ea", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-2xl p-5"
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

      {/* Goal Setting Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
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
                className="flex-1 bg-purple-600 rounded-xl py-4"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold text-center">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
