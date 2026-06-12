import { router } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

export default function SignInScreen() {
  return (
    <View>
      <Text>Sign In</Text>
      <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text>No tienes cuenta? Registrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}
