import { Stack, useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";
import { useEffect } from "react";

function Layout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const hasCompletedOnboarding = user?.unsafeMetadata?.onboardingCompleted;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Only redirect to onboarding if signed in but not completed
    if (isSignedIn && !hasCompletedOnboarding) {
      router.replace("/onboarding");
    }
  }, [isSignedIn, hasCompletedOnboarding, isLoaded]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="purple" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Protected routes - only accessible when signed in */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>

      {/* Auth routes - only accessible when NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default Layout;
