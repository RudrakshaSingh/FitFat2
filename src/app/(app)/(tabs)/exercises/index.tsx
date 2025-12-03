import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Import day images
import mon from "../../../../../assets/days/mon.png";
import tue from "../../../../../assets/days/tue.png";
import wed from "../../../../../assets/days/wed.png";
import thu from "../../../../../assets/days/thu.png";
import fri from "../../../../../assets/days/fri.png";
import sat from "../../../../../assets/days/sat.png";
import sun from "../../../../../assets/days/sun.png";

const FitnessHome = () => {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedDay, setSelectedDay] = useState(null);

  const bodyParts = [
    {
      id: 5,
      name: "Neck",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShrzN9COWhGjfCcJ1GXfsms1bd3ANJ39Vquw&s",
    },
    {
      id: 3,
      name: "Lower Arms",
      image:
        "https://media.istockphoto.com/id/1369575706/photo/shot-of-a-muscular-young-man-exercising-with-a-dumbbell-in-a-gym.jpg?s=612x612&w=0&k=20&c=wrYAWjmcdon4j8m6hEC-EqavvVl0ZoUeC71K6HhN-7c=",
    },
    {
      id: 6,
      name: "Shoulders",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyjL8m4PR4uRzowa6ZNzARI6PnGQkEpTKH4w&s",
    },
    {
      id: 1,
      name: "Cardio",
      image:
        "https://plus.unsplash.com/premium_photo-1664304732747-661c2cd16774?q=80&w=3178&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 7,
      name: "Upper Arms",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1NsTyfJG1tGQlMLyFoTSY855vp04TYQnO3Q&s",
    },
    {
      id: 2,
      name: "Chest",
      image:
        "https://media.istockphoto.com/id/180622473/photo/young-man-working-out-in-the-gym.webp?a=1&b=1&s=612x612&w=0&k=20&c=kgXubq2BbVMesigRF2Wtvw7i5zyjAEvFxzeoKw52J20=",
    },
    {
      id: 4,
      name: "Lower Legs",
      image:
        "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
      id: 0,
      name: "Back",
      image:
        "https://eu.gymshark.com/_next/image?url=https%3A%2F%2Fimages.ctfassets.net%2F8urtyqugdt2l%2FfIOvOyiWNuyVnlhs7LnFt%2F9d2b2df51fdce86e93c0d1b0d28afc1e%2Fdesktop-cbum-back-workout.jpg&w=3840&q=85",
    },
    {
      id: 8,
      name: "Upper Legs",
      image:
        "https://hips.hearstapps.com/hmg-prod/images/young-man-training-on-a-leg-machine-in-the-gym-royalty-free-image-1704212901.jpg?crop=1xw:0.84415xh;center,top&resize=1200:*",
    },
    {
      id: 9,
      name: "Waist",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_THRPSoy6Nb-qr2NBQFMs_z78UfOnbBiohA&s",
    },
  ];

  const weekDays = [
    { day: "Mon", date: "04", image: mon, color: "#FF6B6B" },
    { day: "Tue", date: "05", image: tue, color: "#4ECDC4" },
    { day: "Wed", date: "06", image: wed, color: "#45B7D1" },
    { day: "Thu", date: "07", image: thu, color: "#FFA07A" },
    { day: "Fri", date: "08", image: fri, color: "#98D8C8" },
    { day: "Sat", date: "09", image: sat, color: "#F7B731" },
    { day: "Sun", date: "10", image: sun, color: "#A29BFE" },
  ];

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setCurrentScreen("workout");
  };

  if (currentScreen === "workout") {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setCurrentScreen("home")}
            className="flex-row items-center mb-2"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
            <Text className="text-lg text-gray-900 ml-2 font-semibold">
              Back
            </Text>
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900 mt-2">
            {selectedDay?.day} Workout
          </Text>
          <Text className="text-gray-600 mt-1">
            December {selectedDay?.date}, 2024
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24 }}
        >
          <View className="bg-white rounded-2xl p-8 items-center mb-4 overflow-hidden">
            <Image
              source={selectedDay?.image}
              className="w-32 h-32 rounded-2xl mb-4"
              resizeMode="cover"
            />
            <Text className="text-xl font-semibold text-gray-900">
              Workout Coming Soon
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Your exercises will appear here
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="barbell" size={20} color="#3B82F6" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Exercise routines will be added here
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={20} color="#10B981" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Workout duration and sets
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="stats-chart" size={20} color="#F59E0B" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Progress tracking
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Fitness Hub</Text>
        <Text className="text-gray-600 mt-1">Choose your workout focus</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Body Parts Section */}
        <View className="mt-6">
          <View className="px-6 mb-4">
            <View className="flex-row items-center">
              <FontAwesome5 name="dumbbell" size={18} color="#111827" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Target Area
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {bodyParts.map((part) => (
              <TouchableOpacity
                key={part.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
                style={{ width: 140, height: 140 }}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: part.image }}
                  className="w-full h-full absolute"
                  resizeMode="cover"
                />
                <View className="w-full h-full bg-black/40 items-center justify-center">
                  <Text className="text-white text-center font-bold text-base px-2">
                    {part.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weekly Plan Section */}
        <View className="mt-8 mb-6">
          <View className="px-6 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#111827" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Weekly Plan
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDayClick(day)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200"
                style={{
                  width: 120,
                  paddingVertical: 20,
                  paddingHorizontal: 16,
                }}
                activeOpacity={0.7}
              >
                <View className="items-center">
                  <Image
                    source={day.image}
                    className="w-14 h-14 rounded-full mb-3"
                    resizeMode="cover"
                  />
                  <Text className="text-gray-900 font-bold text-base">
                    {day.day}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Dec {day.date}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Stats */}
        <View className="px-6 mt-4 mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-200">
              <Text className="text-gray-900 text-3xl font-bold">5</Text>
              <Text className="text-gray-600 text-xs mt-1">Days Active</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-200">
              <Text className="text-gray-900 text-3xl font-bold">12</Text>
              <Text className="text-gray-600 text-xs mt-1">Workouts</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 items-center border border-gray-200">
              <Text className="text-gray-900 text-3xl font-bold">3h</Text>
              <Text className="text-gray-600 text-xs mt-1">This Week</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FitnessHome;
