import { View, Image } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Redirige al dashboard después de 3 segundos
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-blue-500 to-blue-100">
      <Image
        source={require("../assets/images/logooficial.png")}
        className="w-40 h-40"
        resizeMode="contain"
      />
    </View>
  );
}
