import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function VerifyEmailScreen() {
  return (
    <View>
      <Text>Verify Email</Text>
      <TouchableOpacity onPress={() => router.replace("/signup")}>
        <Text>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}
