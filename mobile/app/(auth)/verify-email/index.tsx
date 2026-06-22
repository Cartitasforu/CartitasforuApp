import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { deleteOwnAccount } from "@/features/auth/api/delete-own-account";
import { resendOtpCode } from "@/features/auth/api/resend-otp";
import otpVerify from "@/features/auth/api/verify-email";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
} from "react-native";

export default function VerifyEmailScreen() {
  const length = 6;
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const { email } = useLocalSearchParams<{ email: string }>();

  const { refreshProfile } = useAuth();

  const inputRef = useRef<(TextInput | null)[]>([]);

  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const timeFormat = (time: number) => {
    const minutes = Math.floor(time / 60);
    const lastSeconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      lastSeconds < 10 ? "0" : ""
    }${lastSeconds}`;
  };

  const handleChange = (text: string, index: number) => {
    const cleanCode = text.replace(/[^0-9]/g, "");

    if (cleanCode === "") {
      setCode((currentCode) => {
        const nextCode = [...currentCode];
        const hadValue = nextCode[index] !== "";
        nextCode[index] = "";

        if (hadValue && index > 0) {
          setTimeout(() => {
            inputRef.current[index - 1]?.focus();
          }, 10);
        }

        return nextCode;
      });
      return;
    }

    setCode((currentCode) => {
      const nextCode = [...currentCode];
      const digits = cleanCode.slice(0, length - index).split("");

      digits.forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });

      const nextFocusIndex = Math.min(index + digits.length, length - 1);

      if (index + digits.length < length) {
        setTimeout(() => {
          inputRef.current[index + digits.length]?.focus();
        }, 10);
      } else {
        setTimeout(() => {
          inputRef.current[nextFocusIndex]?.blur();
        }, 10);
      }

      return nextCode;
    });
  };

  const handleVerify = async () => {
    const codeDigits = code.join("");

    if (codeDigits.length !== length) {
      Alert.alert("Código incompleto", "Ingresa los 6 dígitos del código.");
      return;
    }

    try {
      await otpVerify(email, codeDigits)
      await refreshProfile()

      Alert.alert("Verificado", "Bienvenido");
      router.replace("/(onboarding)")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo verificar el código";

      Alert.alert("Verificación fallida", message);
    }
  };

  const handleResend = async () => {
    await resendOtpCode(email);
    Alert.alert("Código nuevamente enviado");
  };

  const handleCorrectEmail = async () => {
    await deleteOwnAccount()
    router.replace("/(auth)/signup")
  }


  return (
    <View className="flex-1 bg-bgPink px-10 pt-10">
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
            Te hemos enviado un código de verificación de 6 dígitos
          </AppText>
        </View>
      </View>
      <View className="flex flex-row gap-3 items-center justify-center">
        {code.map((value, index) => (
          <TextInput
            key={index}
            ref={(element: any) => (inputRef.current[index] = element)}
            className="w-12 h-12 rounded-card border-roseBorder bg-white text-center text-wineDark"
            keyboardType="numeric"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            textContentType="oneTimeCode"
            autoFocus={index === 0}
          />
        ))}
      </View>
      <View className="flex flex-row items-center justify-center pt-4 pb-6">
        <AppText>
          {seconds > 0 ? (
            <AppText>El código se vencerá en: {timeFormat(seconds)}</AppText>
          ) : (
            <AppText>Código expirado</AppText>
          )}
        </AppText>
      </View>
      {seconds === 0 && (
        <View className="flex flex-row items-center justify-center pb-6">
          <AppText>No recibiste el código? </AppText>
          <Pressable onPress={handleResend}>
            <Text className="text-primaryDeep">Reenviar</Text>
          </Pressable>
        </View>
      )}
      <AppButton title="Verificar" onPress={handleVerify} className="mt-2" />
      <View className="flex flex-row items-center justify-center pb-6 mt-2">
        <AppText>Escribiste mal tus credenciales? </AppText>
        <Pressable onPress={handleCorrectEmail}>
          <Text className="text-primaryDeep">Volver</Text>
        </Pressable>
      </View>
    </View>
  );
}
