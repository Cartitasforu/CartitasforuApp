import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { signInWithEmailAndPassword } from "@/features/auth/api/sign-in";
import {
  SignInFormData,
  signInSchema,
} from "@/features/auth/schemas/sign-in.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, TouchableOpacity, View } from "react-native";
import {TEXTS} from "./../../../constants/language/es/texts"

export default function SignUpFormScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: SignInFormData) => {
    try {
      await signInWithEmailAndPassword(values);

      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrio un error inesperado";

      Alert.alert("Inicio de sesión fallido", message);
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
          {TEXTS.auth.login_title}
        </AppText>
        <AppText variant="caption" className="text-roseGray text-center">
          {TEXTS.auth.login_form_subtitle}
        </AppText>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label={TEXTS.auth.email_label}
              placeholder={TEXTS.auth.email_placeholder}
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label={TEXTS.auth.password_label}
              placeholder={TEXTS.auth.password_placeholder}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        <View className="flex flex-row justify-center">
          <AppText variant="bodyM">{TEXTS.auth.forgot_password_text} </AppText>
          <Pressable>
            <AppText variant="bodyM" className="text-primaryDeep">
              {TEXTS.auth.forgot_password_link}
            </AppText>
          </Pressable>
        </View>

        <View className="flex flex-row justify-center">
          <AppText variant="bodyM">{TEXTS.auth.no_account_text} </AppText>
          <Pressable onPress={() => router.back()}>
            <AppText variant="bodyM" className="text-primaryDeep">
              {TEXTS.auth.no_account_call_to_action}
            </AppText>
          </Pressable>
        </View>

        <AppButton
          title={TEXTS.auth.complete_login_button}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}
