import { logOut } from "@/features/auth/api/log-out";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";


export default function OnboardingScreen() {
  const onLogOut = async () => {
    await logOut();
  };

  return (
    <View>
      <Text>OnboardingScreen</Text>
      <TouchableOpacity onPress={() => router.replace("/(splash)")}>
        <Text>Volver</Text>
      </TouchableOpacity>
      <Pressable onPress={onLogOut}>
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
