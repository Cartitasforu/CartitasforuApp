import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import resetPassword from "@/features/auth/api/reset-password";
import {
  ResetPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/reset-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function ResetPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (
    values: ResetPasswordSchema
  ) => {
    try {
      await resetPassword(values.password);

      Alert.alert(
        "Contraseña actualizada",
        "Ahora puedes iniciar sesión."
      );

      router.replace("/signin");
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
          Nueva contraseña
        </AppText>

        <AppText
          variant="caption"
          className="text-roseGray text-center"
        >
          Ingresa tu nueva contraseña
        </AppText>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Nueva contraseña"
              placeholder="Nueva contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Confirmar contraseña"
              placeholder="Confirma tu contraseña"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <AppButton
          title="Actualizar contraseña"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}