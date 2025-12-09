import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import bodyParts from "../../../../data/bodyParts";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

// Import day images
import mon from "../../../../../assets/days/mon.png";
import tue from "../../../../../assets/days/tue.png";
import wed from "../../../../../assets/days/wed.png";
import thu from "../../../../../assets/days/thu.png";
import fri from "../../../../../assets/days/fri.png";
import sat from "../../../../../assets/days/sat.png";
import sun from "../../../../../assets/days/sun.png";

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST;

const { width } = Dimensions.get("window");

const dayImages: { [key: string]: any } = {
  Mon: mon,
  Tue: tue,
  Wed: wed,
  Thu: thu,
  Fri: fri,
  Sat: sat,
  Sun: sun,
};

const formatDate = (date: Date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
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

export default function Exercise() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const weekDays = getThisWeek();
  const [equipment, setEquipment] = useState<{ name: string }[]>([]);
  const [muscles, setMuscles] = useState<{ name: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchFilters = async () => {
    setLoading(true);
    try {
      const [equipmentRes, musclesRes] = await Promise.all([
        axios.get("https://exercisedb.p.rapidapi.com/exercises/equipmentList", {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        }),
        axios.get("https://exercisedb.p.rapidapi.com/exercises/targetList", {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
          },
        }),
      ]);

      const sortedEquipment = (equipmentRes.data || []).sort(
        (a: string, b: string) => a.localeCompare(b)
      );
      const sortedMuscles = (musclesRes.data || []).sort(
        (a: string, b: string) => a.localeCompare(b)
      );

      setEquipment(sortedEquipment.map((name: string) => ({ name })));
      setMuscles(sortedMuscles.map((name: string) => ({ name })));
    } catch (error) {
      console.error("Failed to fetch filters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleBodyPartPress = (title: string, image: string) => {
    navigation.navigate("exercise-bodypart", {
      bodyPart: title,
      bodyPartImage: image,
    });
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

  const userName = (user?.unsafeMetadata?.name as string) || "Warrior";

  const renderBodyPart = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleBodyPartPress(item.title, item.image)}
      className="mr-4"
      activeOpacity={0.85}
    >
      <View className="w-40 rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100">
        <Image
          source={{ uri: item.image }}
          className="w-full h-36"
          resizeMode="cover"
        />
        <View className="p-3 bg-white">
          <Text className="text-base font-bold text-gray-800 text-center">
            {item.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWeekDay = ({ item }: any) => {
    const todayStr = `${new Date().getDate()} ${formatDate(new Date()).month}`;
    const isToday = `${item.date} ${item.month}` === todayStr;

    return (
      <TouchableOpacity
        onPress={() => handleDayPress(item.day, item.fullDate)}
        className="mr-4"
        activeOpacity={0.9}
      >
        <View className={`relative rounded-2xl overflow-hidden ${isToday ? 'border-2 border-red-500' : ''}`}>
          <Image
            source={item.image}
            className="w-28 h-36"
            resizeMode="contain"
          />
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 py-2">
            <Text className="text-white text-sm font-bold text-center">
              {item.date} {item.month}
            </Text>
          </View>
          {isToday && (
            <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1">
              <Text className="text-white text-[10px] font-bold">TODAY</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View className="flex-row items-center mb-4">
      <View className="w-1 h-8 bg-pink-500 rounded-full mr-3" />
      <Text className="text-2xl font-bold text-gray-900 flex-1">{title}</Text>
    </View>
  );

  const renderEquipmentPill = (name: string, onPress: () => void) => (
    <TouchableOpacity
      key={name}
      onPress={onPress}
      className="mr-2 mb-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 rounded-full border border-indigo-100"
      activeOpacity={0.7}
    >
      <Text className="text-indigo-700 font-semibold capitalize text-sm">{name}</Text>
    </TouchableOpacity>
  );

  const renderMusclePill = (name: string, onPress: () => void) => (
    <TouchableOpacity
      key={name}
      onPress={onPress}
      className="mr-2 mb-2 bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-2.5 rounded-full border border-pink-100"
      activeOpacity={0.7}
    >
      <Text className="text-pink-700 font-semibold capitalize text-sm">{name}</Text>
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
              await fetchFilters();
              setRefreshing(false);
            }}
            colors={["#ec4899"]}
            tintColor="#ec4899"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-500 text-base">Welcome back,</Text>
              <Text className="text-3xl font-extrabold text-gray-900 mt-1">
                {userName} 💪
              </Text>
            </View>
            <View className="w-12 h-12 bg,100 rounded-full items-center justify-center">
              <Ionicons name="fitness" size={28} color="#ec4899" />
            </View>
          </View>
        </View>

        {/* My Library Card */}
        <View className="px-6 mt-2">
          <TouchableOpacity
            onPress={() => router.push("/(app)/user-library")}
            activeOpacity={0.9}
            className="rounded-3xl overflow-hidden shadow-xl"
          >
            <View className="relative">
              <Image
                source={require("../../../../../assets/bg-image.jpg")}
                style={{ width: "100%", height: 140 }}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/40" />
              <View className="absolute inset-0 justify-center items-center">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="bookshelf" size={28} color="white" />
                  <Text className="text-white text-2xl font-bold ml-3">
                    {userName}'s Library
                  </Text>
                </View>
                <Text className="text-white/80 text-sm mt-1">
                  Your saved exercises & custom workouts
                </Text>
              </View>
              <View className="absolute bottom-3 right-3 bg-white/20 rounded-full p-2">
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Tip */}
        <View className="px-6 mt-4">
          <View className="flex-row items-start bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <Ionicons name="bulb" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
            <Text className="text-blue-700 ml-3 flex-1 text-sm leading-5">
              Create custom exercises or save from our library to use in your workouts!
            </Text>
          </View>
        </View>

        {/* Weekly Program */}
        <View className="mt-8 px-6">
          <SectionHeader title="Weekly Program" icon="calendar" />
          <FlatList
            data={weekDays}
            renderItem={renderWeekDay}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
        </View>

        {/* Target Body Parts */}
        <View className="mt-10 px-6">
          <SectionHeader title="Target Body Parts" icon="body" />
          <FlatList
            data={bodyParts}
            renderItem={renderBodyPart}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          />
        </View>

        {/* Equipment Section */}
        <View className="mt-10 px-6">
          <SectionHeader title="By Equipment" icon="barbell" />
          {loading && !refreshing ? (
            <View className="py-8 items-center">
              <Text className="text-gray-400">Loading equipment...</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {equipment.map((item) =>
                renderEquipmentPill(item.name, () => handleEquipmentPress(item.name))
              )}
            </View>
          )}
        </View>

        {/* Muscles Section */}
        <View className="mt-10 px-6 pb-12">
          <SectionHeader title="Target Muscles" icon="fitness" />
          {loading && !refreshing ? (
            <View className="py-8 items-center">
              <Text className="text-gray-400">Loading muscles...</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap">
              {muscles.map((item) =>
                renderMusclePill(item.name, () => handleMusclePress(item.name))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
