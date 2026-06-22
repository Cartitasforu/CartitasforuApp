import { View, Text, Pressable, Alert } from "react-native";
import { Mail } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from "react";
import {TEXTS} from "./../../../constants/language/es/texts"

export default function LoginScreen() {
  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);


  return (
    <View className="flex-1 bg-bgPink px-4 justify-center">
      {/* Header */}
      <View className="mt-12 justify-center items-center mb-8">
        <Text className="font-1  text-display text-wineDark">
          {TEXTS.auth.login_title}
        </Text>
        <Text className="font-body text-body-m text-roseGray mt-5">
          {TEXTS.auth.login_subtitle}
        </Text>
      </View>
      <Pressable className="flex-row items-center justify-center bg-white rounded-pill min-h-button mb-3 px-4">
        <FontAwesome6
          name="google"
          size={18}
          color="#bbb"
          style={{ marginRight: 12 }}
        />
        <Text className="font-body text-button text-wineDark">
          {loadingGoogle ? "Conectando..." : TEXTS.auth.google_login_button}
        </Text>
      </Pressable>

      <Pressable className="flex-row items-center justify-center bg-wineDark rounded-pill min-h-button mb-4 px-4">
        <FontAwesome6
          name="apple"
          size={20}
          color="#fff"
          style={{ marginRight: 12 }}
        />
        <Text className="font-body text-button text-white">
          {TEXTS.auth.apple_login_button}
        </Text>
      </Pressable>

      {/* Divider */}
      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-[1px] bg-roseBorder" />
        <Text className="font-body text-body-m text-roseGray mx-3">o</Text>
        <View className="flex-1 h-[1px] bg-roseBorder" />
      </View>

      {/* Email button */}
      <Pressable
        className="flex-row items-center justify-center bg-primary rounded-pill min-h-button mb-6 px-4"
        onPress={() => router.push("/(auth)/signin/sign-in-form")}
      >
        <Mail size={20} color="#fff" style={{ marginRight: 12 }} />
        <Text className="font-body text-button text-white">
          {TEXTS.auth.email_login_button}
        </Text>
      </Pressable>

      {/* Signup link */}
      <View className="flex-row justify-center">
        <Text className="font-body text-body-m text-roseGray">
          {TEXTS.auth.no_account_text}{" "}
        </Text>
        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <Text className="font-body text-body-m text-primary font-medium">
            {TEXTS.auth.no_account_call_to_action}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}