import "../global.css";
import { Slot } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider } from "@clerk/clerk-expo";
import { StatusBar, Text, View } from "react-native";
import Constants from "expo-constants";

// Get publishable key from environment or Constants (for EAS builds)
const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  Constants.expoConfig?.extra?.clerkPublishableKey;

export default function Layout() {
  // Handle missing Clerk key gracefully instead of crashing
  if (!publishableKey) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>
          Configuration Error: Clerk publishable key is missing.
        </Text>
        <Text style={{ color: "#666", marginTop: 10, textAlign: "center" }}>
          Please ensure EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is set in your environment.
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <Slot />
    </ClerkProvider>
  );
}
