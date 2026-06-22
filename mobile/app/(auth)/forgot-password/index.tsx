import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import  forgotPassword  from "@/features/auth/api/forgot-password";
import {
  ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/features/auth/schemas/forgot-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (
    values: ForgotPasswordSchema
  ) => {
    try {
      await forgotPassword(values.email);

      Alert.alert(
        "Correo enviado",
        "Revisa tu bandeja de entrada."
      );

      router.back();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error.";

      Alert.alert("Error", message);
    }
  };

  return (
    <View className="flex-1 bg-bgPink px-5 pt-10">
      <View className="gap-2 mb-20">
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Volver</Text>
        </TouchableOpacity>

        <AppText
          variant="display"
          className="text-display text-center pt-40 pb-4"
        >
          Recuperar contraseña
        </AppText>

        <AppText
          variant="caption"
          className="text-roseGray text-center"
        >
          Te enviaremos un enlace a tu correo
        </AppText>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Correo"
              placeholder="Ingresa tu correo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              error={errors.email?.message}
            />
          )}
        />

        <AppButton
          title="Enviar enlace"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}