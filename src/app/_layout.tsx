import "../global.css";
import { Slot, Stack, Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="(app)/index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="(app)/profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="(app)/history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
