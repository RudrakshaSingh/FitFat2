import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ExerciseDetail() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 bg-white ">
      <Text>Exercise Detail :{id}</Text>
    </SafeAreaView>
  );
}

export default ExerciseDetail;
