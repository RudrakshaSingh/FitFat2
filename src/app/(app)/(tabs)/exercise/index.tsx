import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native"; // Add this import at the top
// Import body parts
import bodyParts from "../../../../data/bodyParts";

import axios from "axios";
import { useEffect, useState } from "react";

// Add these lines right after your imports
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST;

// Import day images
import mon from "../../../../../assets/days/mon.png";
import tue from "../../../../../assets/days/tue.png";
import wed from "../../../../../assets/days/wed.png";
import thu from "../../../../../assets/days/thu.png";
import fri from "../../../../../assets/days/fri.png";
import sat from "../../../../../assets/days/sat.png";
import sun from "../../../../../assets/days/sun.png";

const dayImages: { [key: string]: any } = {
  Mon: mon,
  Tue: tue,
  Wed: wed,
  Thu: thu,
  Fri: fri,
  Sat: sat,
  Sun: sun,
};

// ── Dynamic Week Generator ──────────────────────
const formatDate = (date: Date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return {
    dayName: days[date.getDay()],
    date: date.getDate(),
    month: months[date.getMonth()],
  };
};

const getThisWeek = () => {
  const today = new Date();
  const start = new Date(today);
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay(); // Monday start
  start.setDate(today.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const f = formatDate(date);
    return {
      id: i.toString(),
      day: f.dayName,
      date: f.date,
      month: f.month,
      fullDate: date,
      image: dayImages[f.dayName],
    };
  });
};

export default function Excercise() {
  const navigation = useNavigation<any>();
  const weekDays = getThisWeek();
  const [equipment, setEquipment] = useState<{ name: string }[]>([]);
  const [muscles, setMuscles] = useState<{ name: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const [equipRes, muscleRes] = await Promise.all([
        axios.get(
          "https://exercisedb-api-v1-dataset1.p.rapidapi.com/api/v1/equipments",
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": RAPIDAPI_HOST,
            },
          }
        ),
        axios.get(
          "https://exercisedb-api-v1-dataset1.p.rapidapi.com/api/v1/muscles",
          {
            headers: {
              "x-rapidapi-key": RAPIDAPI_KEY,
              "x-rapidapi-host": RAPIDAPI_HOST,
            },
          }
        ),
      ]);

      if (equipRes.data.success) {
        const sortedEquipment = equipRes.data.data.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        setEquipment(sortedEquipment);
      }

      if (muscleRes.data.success) {
        const sortedMuscles = muscleRes.data.data.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        );
        setMuscles(sortedMuscles);
      }
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    } finally {
      setLoading(false);
    }
  };

  // Then call it on mount
  useEffect(() => {
    fetchFilters();
  }, []);

  const handleBodyPartPress = (title: string) => {
    navigation.navigate("exercise-bodypart", { bodyPart: title });
  };

  const handleDayPress = (day: string, fullDate: Date) => {
    navigation.navigate("DailyWorkout", { day, date: fullDate.toISOString() });
  };

  const handleEquipmentPress = (name: string) => {
    navigation.navigate("exercise-equipment", { equipment: name });
  };

  const handleMusclePress = (name: string) => {
    navigation.navigate("exercise-muscle", { muscle: name });
  };

  const renderBodyPart = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleBodyPartPress(item.title)}
      className="mr-6 items-center"
      activeOpacity={0.8}
    >
      <View className="w-44 h-44 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <Text className="mt-4 text-xl font-bold text-gray-800">{item.title}</Text>
    </TouchableOpacity>
  );

  const renderWeekDay = ({ item }: any) => {
    const todayStr = `${new Date().getDate()} ${formatDate(new Date()).month}`;
    const isToday = `${item.date} ${item.month}` === todayStr;

    return (
      <TouchableOpacity
        onPress={() => handleDayPress(item.day, item.fullDate)}
        className="mr-5"
        activeOpacity={0.9}
      >
        <View className="relative">
          <Image
            source={item.image}
            className="w-32 h-40"
            resizeMode="contain"
          />
          <View className=" items-center">
            <Text className="text-white text-xl text-black font-bold drop-shadow-lg">
              {item.date} {item.month}
            </Text>
          </View>
          {isToday && (
            <View className="absolute -top-2 right-0 bg-red-600 rounded-full px-4 py-1.5 shadow-lg">
              <Text className="text-white text-xs font-bold">TODAY</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Pill-style cards for equipment & specific muscles
  const renderPill = (name: string, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      className="mr-3 mb-3 bg-indigo-100 px-5 py-3 rounded-full border border-indigo-200"
      activeOpacity={0.8}
    >
      <Text className="text-indigo-800 font-semibold capitalize">{name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              setLoading(true);
              await fetchFilters(); // Re-use your existing fetch function
              setRefreshing(false);
            }}
            colors={["#ec4899"]} // Pink spinner (matches your theme)
            tintColor="#ec4899"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-6 bg-white">
          <Text className="text-4xl font-extrabold text-gray-900">
            Hello Warrior
          </Text>
          <Text className="text-lg text-gray-600 mt-2">
            Ready to dominate today?
          </Text>
        </View>

        {/* Weekly Program */}
        <View className="mt-10 px-6">
          <View className="flex-row items-start mb-4">
            <View
              className="w-1.5 bg-pink-600 rounded-full mr-3"
              style={{ height: "100%", minHeight: 32 }}
            />
            <Text className="text-3xl font-bold text-gray-800 flex-1 leading-tight">
              Weekly Program
            </Text>
          </View>

          <FlatList
            data={weekDays}
            renderItem={renderWeekDay}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="py-2"
          />
        </View>

        {/* Target Specific BodyPart */}
        <View className="mt-12 px-6">
          <View className="flex-row items-start mb-4">
            <View
              className="w-1.5 bg-pink-600 rounded-full mr-3"
              style={{ height: "100%", minHeight: 32 }}
            />
            <Text className="text-3xl font-bold text-gray-800 flex-1 leading-tight">
              Target Specific BodyPart
            </Text>
          </View>

          <FlatList
            data={bodyParts}
            renderItem={renderBodyPart}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="py-2"
          />
        </View>

        {/* Equipment */}
        <View className="mt-12 px-6">
          <View className="flex-row items-start mb-4">
            <View
              className="w-1.5 bg-pink-600 rounded-full mr-3"
              style={{ height: "100%", minHeight: 32 }}
            />
            <Text className="text-3xl font-bold text-gray-800 flex-1 leading-tight">
              Train with Specific Equipment
            </Text>
          </View>

          {loading && !refreshing ? (
            <Text className="text-gray-500 text-center py-8">
              Loading equipment...
            </Text>
          ) : (
            <View className="flex-row flex-wrap">
              {equipment.map((item) => (
                <View key={item.name}>
                  {renderPill(item.name, () => handleEquipmentPress(item.name))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Specific Muscles */}
        <View className="mt-12 px-6 pb-10">
          <View className="flex-row items-start mb-4">
            <View
              className="w-1.5 bg-pink-600 rounded-full mr-3"
              style={{ height: "100%", minHeight: 32 }}
            />
            <Text className="text-3xl font-bold text-gray-800 flex-1 leading-tight">
              Train Specific Muscles For Max Results
            </Text>
          </View>

          {loading && !refreshing ? (
            <Text className="text-gray-500 text-center py-8">
              Loading muscles...
            </Text>
          ) : (
            <View className="flex-row flex-wrap">
              {muscles.map((item) => (
                <View key={item.name}>
                  {renderPill(item.name, () => handleMusclePress(item.name))}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
