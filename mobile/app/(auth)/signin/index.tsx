import { View, Text, Pressable, Alert } from "react-native";
import { Mail } from "lucide-react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from '@expo/vector-icons';
import { useState } from "react";
import { signInWithGoogle } from "@/providers/googleAuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const { error, cancelled } = await signInWithGoogle();
    setLoadingGoogle(false);

    if (cancelled) return;

    if (error) {
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
      console.log(error.message);
    }
  };

  return (
    <View className="flex-1 bg-bgPink px-4 justify-center">
      {/* Header */}
      <View className="mt-12 justify-center items-center mb-8">
        <Text className="font-1  text-display text-wineDark">
          Inicia sesión
        </Text>
        <Text className="font-body text-body-m text-roseGray mt-5">
          Este es su espacio, sean felices y disfruten otra frase
        </Text>
      </View>
      <Pressable
        className="flex-row items-center justify-center bg-white rounded-pill min-h-button mb-3 px-4"
        onPress={handleGoogleLogin}
        disabled={loadingGoogle}
      >
        <FontAwesome6 name="google" size={18} color="#bbb" style={{ marginRight: 12 }} />
        <Text className="font-body text-button text-wineDark">
          {loadingGoogle ? "Conectando..." : "Iniciar sesión con Google"}
        </Text>
      </Pressable>

      <Pressable className="flex-row items-center justify-center bg-wineDark rounded-pill min-h-button mb-4 px-4">
        <FontAwesome6 name="apple" size={20} color="#fff" style={{ marginRight: 12 }} />
        <Text className="font-body text-button text-white">
          Iniciar sesión con Apple
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
        onPress={() => router.push("/(auth)/signup")}
      >
        <Mail size={20} color="#fff" style={{ marginRight: 12 }} />
        <Text className="font-body text-button text-white">
          Ingresar con correo y contraseña
        </Text>
      </Pressable>

      {/* Signup link */}
      <View className="flex-row justify-center">
        <Text className="font-body text-body-m text-roseGray">
          No tienes cuenta?{" "}
        </Text>
        <Pressable onPress={() => router.push("/(auth)/signup")}>
          <Text className="font-body text-body-m text-primary font-medium">
            Regístrate aquí
          </Text>
        </Pressable>
      </View>
    </View>
  );
}