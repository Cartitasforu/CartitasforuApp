import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { deleteOwnAccount } from "@/features/auth/api/delete-own-account";
import { resendOtpCode } from "@/features/auth/api/resend-otp";
import otpVerify from "@/features/auth/api/verify-email";
import { useCodeInput } from "@/hooks/useCodeInput";
import { useAuth } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import {TEXTS} from "./../../../constants/language/es/texts"


export default function VerifyEmailScreen() {
  const length = 6;
  const { email } = useLocalSearchParams<{ email: string }>();

  const { refreshProfile } = useAuth();


  const [seconds, setSeconds] = useState(60);

  const {code, inputRef, handleChange} = useCodeInput(length, )

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
            {TEXTS.auth.verify_email_title_first_part}
          </AppText>
          <AppText variant="display" className="text-center text-display">
            {TEXTS.auth.verify_email_title_second_part}
          </AppText>
        </View>
        <View className="gap-2">
          <AppText variant="caption" className="text-center">
            {TEXTS.auth.verify_email_subtitle}
          </AppText>
          <AppText variant="caption" className="text-center">
            {TEXTS.auth.verify_email_second_subtitle}
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
            <AppText>
              {TEXTS.auth.code_expiring_in} {timeFormat(seconds)}
            </AppText>
          ) : (
            <AppText>{TEXTS.auth.code_expired}</AppText>
          )}
        </AppText>
      </View>
      {seconds === 0 && (
        <View className="flex flex-row items-center justify-center pb-6">
          <AppText>{TEXTS.auth.no_code_sent_text}</AppText>
          <Pressable onPress={handleResend}>
            <Text className="text-primaryDeep">
              {TEXTS.auth.no_code_sent_link}
            </Text>
          </Pressable>
        </View>
      )}
      <AppButton title="Verificar" onPress={handleVerify} className="mt-2" />
      <View className="flex flex-row items-center justify-center pb-6 mt-2">
        <AppText>{TEXTS.auth.correct_credentials_text} </AppText>
        <Pressable onPress={handleCorrectEmail}>
          <Text className="text-primaryDeep">
            {TEXTS.auth.correct_credentials_link}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
