import React, { useCallback, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO } from "@clerk/clerk-expo";
import { View, Platform, TouchableOpacity, Text } from "react-native";
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

// Preloads the browser for Android devices to reduce authentication load time
// See: https://docs.expo.dev/guides/authentication/#improving-user-experience
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignIn() {
  useWarmUpBrowser();

  const router = useRouter();

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO();

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } =
        await startSSOFlow({
          strategy: "oauth_google",
          // For web, defaults to current path
          // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
          // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
          // Check for session tasks and navigate to custom UI to help users resolve them
          // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask);
              router.push("/sign-in/tasks");
              return;
            }

            router.push("/");
          },
        });
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  }, []);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        <GoogleIcon size={20} />

        <Text className="text-gray-900 font-semibold text-lg ml-3">
          Continue with Google
        </Text>
      </View>
    </TouchableOpacity>
  );
}
