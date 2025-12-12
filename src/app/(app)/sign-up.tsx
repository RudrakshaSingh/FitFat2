import * as React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    if (!emailAddress || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling

      console.log("SIGNUP ERROR:", err?.errors ?? err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      console.log("VERIFY RESULT:", result);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
        return;
      }
    } catch (err: any) {
      const errorCode = err?.errors?.[0]?.code;

      // FIX: If already verified, activate user manually
      if (errorCode === "verification_already_verified") {
        console.log("Already verified. Activating user...");

        const sessionId = signUp.createdSessionId;

        if (sessionId) {
          await setActive({ session: sessionId });
          router.replace("/(tabs)");
          return;
        }

        console.log("No session found — redirecting to sign-in.");
        router.replace("/sign-in");
        return;
      }

      console.log("VERIFY ERROR:", err?.errors || err);
      alert(err?.errors?.[0]?.message || "Verification failed.");
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAwareScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={150} // lifts input above keyboard
          extraHeight={150}
          keyboardOpeningTime={0}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center">
            {/* Logo / Branding */}
            <View className="items-center mb-8">
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
                Join FitFat
              </Text>

              <Text className="text-lg text-gray-600 text-center">
                Start your fitness journey{"\n"}and achieve your goals
              </Text>
            </View>

            {/* Verification form */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Enter Verification Code
              </Text>

              {/* Code Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border border-gray-200">
                  <Ionicons name="key-outline" size={20} color="#687280" />
                  <TextInput
                    className="flex-1 ml-3 text-lg text-gray-900 text-center tracking-widest"
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#687280"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    keyboardType="numeric"
                    maxLength={6}
                    editable={!isLoading}
                  />
                </View>
              </View>
              {/* Verify Button */}
              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={isLoading}
                activeOpacity={0.8}
                className={`rounded-xl py-4 shadow-sm mb-4 ${
                  isLoading ? "bg-gray-400" : "bg-purple-600"
                }`}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="white" />
                  ) : (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="white"
                    />
                  )}

                  <Text className="text-center text-white text-lg font-bold">
                    {isLoading ? "Verifying..." : "Verify Account"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Resend Code */}
              <TouchableOpacity className="py-2">
                <Text className="text-center text-gray-400 font-medium">
                  Didn't receive a code?{" "}
                  <Text className="text-purple-600 text-center font-medium">
                    Resend Code
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* footer */}
          <View className="pb-6">
            <Text className="text-gray-600 text-center text-sm">
              Almost there! Just one more step to join FitFat.
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={150} // pushes inputs above keyboard
        extraHeight={150}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* main */}
        <View className="flex-1 justify-center">
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
              Join FitFat
            </Text>

            <Text className="text-lg text-gray-600 text-center">
              Start your fitness journey{"\n"}and achieve your goals
            </Text>
          </View>

          {/* Form signup */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Create your account
            </Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-500 mb-2">
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
              <Text className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters.
              </Text>
            </View>
            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={isLoading}
              activeOpacity={0.8}
              className={`rounded-xl py-4 shadow-sm mb-4 ${
                isLoading ? "bg-gray-400" : "bg-purple-600"
              }`}
            >
              <View className="flex-row items-center justify-center">
                {isLoading ? (
                  <Ionicons name="refresh" size={20} color="white" />
                ) : (
                  <Ionicons name="person-add-outline" size={20} color="white" />
                )}

                <Text className="text-white font-semibold text-lg ml-2">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Terms of Service */}
            <Text className="text-xs text-gray-500 text-center mb-4">
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </Text>
          </View>
          {/* sign in link */}
          <View className="flex-row justify-center items-center mb-6">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/sign-in">
              <Text className="text-purple-600 font-semibold">Sign In</Text>
            </Link>
          </View>
        </View>
        {/* footer */}
        <View className="pb-6">
          <Text className="text-gray-600 text-center text-sm">
            Ready to get fit and transform?
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
