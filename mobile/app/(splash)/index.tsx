import { useEffect } from "react";
import { View, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";

export default function SplashScreen() {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/signin");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [session, router]);

  return (
    <View className="flex-1 bg-bgPink items-center justify-center">
      <Image
        source={require("@/assets/images/core/logo.png")}
        className="w-32 h-32"
        resizeMode="contain"
      />
    </View>
  );
}
