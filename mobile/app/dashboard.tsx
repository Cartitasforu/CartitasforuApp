import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Dashboard() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl font-bold text-blue-600 mb-4">
          Dashboard
        </Text>
        <Text className="text-lg text-gray-600 text-center mb-8">
          Bienvenido a Cartitas For U
        </Text>

        <TouchableOpacity
          className="bg-blue-600 px-8 py-4 rounded-lg"
          onPress={() => router.replace("/")}
        >
          <Text className="text-white text-lg font-semibold">
            Volver al Splash
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
