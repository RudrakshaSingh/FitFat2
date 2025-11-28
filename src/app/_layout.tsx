import "../global.css";
import { Slot } from "expo-router";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ClerkProvider } from "@clerk/clerk-expo";

export default function Layout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Slot />
    </ClerkProvider>
  );
}
