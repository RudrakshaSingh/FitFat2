import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import GoogleSignIn from "../components/GoogleSignIn";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;
    if (!emailAddress || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 24 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header section */}
          <View className="flex-1  justify-center">
            {/* Logo / Branding */}
            <View className="items-center mb-8 mt-4">
              <LinearGradient
                colors={["#2563eb", "#9333ea"]} // blue-600 → purple-600
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="fitness" size={40} color="white" />
              </LinearGradient>

              <Text className="text-3xl font-bold text-gray-900 mb-2">
                FitFat
              </Text>

              <Text className="text-lg text-gray-600 text-center">
                Track your fitness journey{"\n"}and reach your goals
              </Text>
            </View>

            {/* Form  signin  */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Welcome Back
              </Text>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>

                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons name="mail-outline" size={20} color="#687280" />

                  <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    onChangeText={setEmailAddress}
                    className="flex-1 ml-3 text-gray-900"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>

                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#687280"
                  />

                  <TextInput
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    className="flex-1 ml-3 text-gray-900"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={onSignInPress}
              disabled={isLoading}
              activeOpacity={0.8}
              className={`rounded-xl py-4 shadow-sm mb-4 ${
                isLoading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <Ionicons name="refresh" size={20} color="white" />
                ) : (
                  <Ionicons name="log-in-outline" size={20} color="white" />
                )}

                <Text className="text-white font-semibold text-lg ml-2">
                  {isLoading ? "Signing In..." : "Sign In"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-2 text-gray-400">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* google sign in */}
            <GoogleSignIn />

            {/* Sign up link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">New to FitFat? </Text>
              <Link href="/sign-up">
                <Text className="text-blue-600 font-semibold">Sign Up</Text>
              </Link>
            </View>
          </View>

          {/* footer */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-center text-sm">
              Start your fitness journey today!
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
