import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { router } from "expo-router";
import { ChangeEvent, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Alert } from "react-native";

interface VerificationCode {
  input1: string,
  input2: string,
  input3: string,
  input4: string,
  input5: string,
  input6: string,
}

export default function VerifyEmailScreen() {
  const [code, setCode] = useState<VerificationCode>({
    input1: '',
    input2: '',
    input3: '',
    input4: '',
    input5: '',
    input6: ''
  })

  

  const codeDigits: string = `${code.input1}${code.input2}${code.input3}${code.input4}${code.input5}${code.input6}`; 

  const handleVerify = () => {
    console.log(codeDigits)
    Alert.alert(codeDigits)
  }



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
      <View className="flex flex-row gap-3 items-center justify-center">
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input1}
          onChangeText={(newInput) => setCode({ ...code, input1: newInput })}
        />
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input2}
          onChangeText={(newInput) => setCode({ ...code, input2: newInput })}
        />
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input3}
          onChangeText={(newInput) => setCode({ ...code, input3: newInput })}
        />
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input4}
          onChangeText={(newInput) => setCode({ ...code, input4: newInput })}
        />
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input5}
          onChangeText={(newInput) => setCode({ ...code, input5: newInput })}
        />
        <AppInput
          className="w-12 h-12 text-center"
          maxLength={1}
          value={code.input6}
          onChangeText={(newInput) => setCode({ ...code, input6: newInput })}
        />
      </View>
      <View className="flex flex-row items-center justify-center pt-4 pb-6">
        <AppText>No recibiste el código? </AppText>
        <Pressable onPress={() => Alert.alert("Reenviar")}>
          <Text className="text-primaryDeep">Reenviar</Text>
        </Pressable>
      </View>
      <AppButton title="Verificar" onPress={handleVerify} className="mt-2" />
    </View>
  );
}
