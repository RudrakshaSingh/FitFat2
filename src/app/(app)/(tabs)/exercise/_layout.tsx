import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="exercise-bodypart"
        options={{
          headerShown: true,
          headerTitle: "Excercises by Body Part",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="exercise-muscle"
        options={{
          headerShown: true,
          headerTitle: "Excercises by Muscle",
          headerTitleAlign: "center",
        }}
      />
      <Stack.Screen
        name="exercise-equipment"
        options={{
          headerShown: true,
          headerTitle: "Excercises by Equipment",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}

export default Layout;
