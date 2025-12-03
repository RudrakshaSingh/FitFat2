import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="exercise-bodypart"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="exercise-muscle"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="exercise-equipment"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          statusBarHidden: true,
        }}
      />
      <Stack.Screen
        name="user-excercise-library"
        options={{
          headerShown: false,
          presentation: "modal",
          animation: "slide_from_bottom",
          statusBarHidden: true,
        }}
      />
    </Stack>
  );
}

export default Layout;
