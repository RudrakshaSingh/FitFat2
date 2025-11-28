import React from "react";
import { Text, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";

export default function Profile() {
  const { signOut } = useAuth(); // ✅ Hook at top level

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut(), // ✅ Works
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>

      <View className="px-6 mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-600 rounded-2xl p-4 shadow-sm"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
