import AntDesign from "@expo/vector-icons/AntDesign";
import { Tabs } from "expo-router";
import Entypo from "@expo/vector-icons/Entypo";

function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingBottom: 8,
          height: 56,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercise"
        options={{
          title: "Exercises",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Entypo name="circle-with-plus" size={size + 4} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-workout"
        options={{
          title: "Active Workout",
          headerShown: false,
          href: null, //will remain invisible
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

export default Layout;
