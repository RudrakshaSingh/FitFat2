import "../global.css";
import { Slot, Stack, Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ClerkProvider } from "@clerk/clerk-expo";

export default function Layout() {
  return (
    <ClerkProvider>
      <Slot />
    </ClerkProvider>
  );
}
