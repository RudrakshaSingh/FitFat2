import "../global.css";
import { Slot } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider } from "@clerk/clerk-expo";
import { StatusBar } from "react-native";

export default function Layout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <Slot />
    </ClerkProvider>
  );
}
