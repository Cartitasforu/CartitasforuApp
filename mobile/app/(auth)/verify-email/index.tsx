import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { router } from "expo-router";
import { View, Text, TouchableOpacity, Pressable, Alert } from "react-native";

export default function VerifyEmailScreen() {
  return (
    <View className="flex-1 bg-bgPink px-10 pt-10">
      <TouchableOpacity onPress={() => router.replace("/signup")}>
        <Text>Volver</Text>
      </TouchableOpacity>
      <View className="gap-8 mb-20">
        <View className="gap-2">
          <AppText variant="display" className="text-center text-display pt-28">
            Código de
          </AppText>
          <AppText variant="display" className="text-center text-display">
            verificación
          </AppText>
        </View>
        <View className="gap-2">
          <AppText variant="caption" className="text-center">
            Verifica tu cuenta
          </AppText>
          <AppText variant="caption" className="text-center">
            Te hemos enviado un código de verificación de 4 dígitos
          </AppText>
        </View>
      </View>
      <View className="flex flex-row gap-6 items-center justify-center">
        <AppInput className="w-16 h-16 text-center" />
        <AppInput className="w-16 h-16 text-center" />
        <AppInput className="w-16 h-16 text-center" />
        <AppInput className="w-16 h-16 text-center" />
      </View>
      <View className="flex flex-row items-center justify-center pt-4 pb-6">
        <AppText>No recibiste el código? </AppText>
        <Pressable onPress={() => Alert.alert("Reenviar")}>
          <Text className="text-primaryDeep">Reenviar</Text>
        </Pressable>
      </View>
      <AppButton
        title="Verificar"
        onPress={() => Alert.alert("verificado")}
        className="mt-2"
      />
    </View>
  );
}
