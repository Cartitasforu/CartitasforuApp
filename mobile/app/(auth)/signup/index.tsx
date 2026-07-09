import { SignUpFormData, signUpSchema } from '@/features/auth/schemas/sign-up.schema';
import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signUp } from '@/features/auth/api/sign-up';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';
import {TEXTS} from "./../../../constants/language/es/texts"

export default function SignUpScreen () {
    const [passwordShown, setPasswordShown] = useState(false)
    const {control, handleSubmit, formState: {errors, isSubmitting}} = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: ""
        },
        mode: "onSubmit"
    })

    const onSubmit = async (values: SignUpFormData) => {
        try {
            await signUp(values)

            Alert.alert("Cuenta creada",
                "Revisa tu correo para verificar tu cuenta"
            )
            router.replace({ 
              pathname: "/verify-email", 
              params: { email: values.email } 
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : "Ocurrio un error inesperado"

            Alert.alert("Registro fallido", message)
        }
    }

    const togglePassword = () => setPasswordShown(prev => !prev)

  return (
    <View className="flex-1 bg-bgPink px-5 pt-10">
      <View className="gap-2 mb-20">
        <TouchableOpacity onPress={() => router.replace("/signin")}>
          <Text>{"<-- "} Volver</Text>
        </TouchableOpacity>
        <AppText
          variant="display"
          className="text-display text-center pt-40 pb-4"
        >
          {TEXTS.auth.signup_title}
        </AppText>
        <AppText variant="caption" className="text-roseGray text-center">
          {TEXTS.auth.signup_subtitle}
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
              secureTextEntry={!passwordShown}
              error={errors.password?.message}
              showPasswordToggle
              passwordVisible={passwordShown}
              onTogglePassword={togglePassword}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label={TEXTS.auth.confirm_password_label}
              placeholder={TEXTS.auth.confirm_password_placeholdedr}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={!passwordShown}
              error={errors.confirmPassword?.message}
              showPasswordToggle
              passwordVisible={passwordShown}
              onTogglePassword={togglePassword}
            />
          )}
        />

        <AppButton
          title={TEXTS.auth.complete_signup_button}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}
