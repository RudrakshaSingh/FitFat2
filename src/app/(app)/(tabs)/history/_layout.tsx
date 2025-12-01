import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="workout-record"
        options={{
          headerShown: true,
          headerTitle: "Workout Record",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}

export default Layout;
