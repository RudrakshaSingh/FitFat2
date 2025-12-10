import React, { useCallback, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { View, Platform, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

export const GoogleIcon = ({ size = 20 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 533.5 544.3">
      <Path
        fill="#4285F4"
        d="M533.5 278.4c0-17.4-1.6-34.1-4.7-50.4H272.1v95.4h147c-6.3 34.1-25 63-53.2 82.4v68.3h85.9c50.3-46.3 81.7-114.6 81.7-195.7z"
      />
      <Path
        fill="#34A853"
        d="M272.1 544.3c72.1 0 132.7-23.5 176.9-63.5l-85.9-68.3c-23.8 15.9-54.3 25.1-91 25.1-69.9 0-129.1-47.2-150.3-110.5H34.6v69.8C78.5 482.1 168.5 544.3 272.1 544.3z"
      />
      <Path
        fill="#FBBC05"
        d="M121.8 327c-5.6-16.9-8.8-35-8.8-53.4s3.2-36.5 8.8-53.4v-69.8H34.6C12.6 199.7 0 236.5 0 273.6c0 37.1 12.6 73.9 34.6 123.2l87.2-69.8z"
      />
      <Path
        fill="#EA4335"
        d="M272.1 107.7c39.2 0 74.3 13.5 102 40l76.5-76.5C404.7 24.2 344.2 0 272.1 0 168.5 0 78.5 62.2 34.6 202.6l87.2 69.8C143 154.9 202.2 107.7 272.1 107.7z"
      />
    </Svg>
  );
};

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
  useWarmUpBrowser();

  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const [isLoading, setIsLoading] = useState(false);

  const onPress = useCallback(async () => {
    try {
      setIsLoading(true);
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        // Set the active session first
        await setActive!({ session: createdSessionId });

        // Then navigate using the same method as email sign-in
        router.replace("/");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      setIsLoading(false);
    }
  }, [router]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      className={`bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm ${
        isLoading ? "opacity-70" : ""
      }`}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        {isLoading ? (
          <ActivityIndicator size="small" color="#4B5563" /> // gray-600
        ) : (
          <GoogleIcon size={20} />
        )}

        <Text className="text-gray-900 font-semibold text-lg ml-3">
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
