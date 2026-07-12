import { SignUpFormData, signUpSchema } from '@/features/auth/schemas/sign-up.schema';
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signUp } from '@/features/auth/api/sign-up';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/app-text';
import { AppInput } from '@/components/ui/app-input';
import { AppButton } from '@/components/ui/app-button';

export default function SignUpScreen () {
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
            router.replace("/verify-email")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Ocurrio un error inesperado"

            Alert.alert("Registro fallido", message)
        }
    }
  return (
    <View className="flex-1 bg-bgPink px-5 pt-10">
      <View className="gap-2 mb-20">
        <AppText variant="display" className="text-display text-center pt-40 pb-4">
          Registrate
        </AppText>
        <AppText
          variant="caption"
          className="text-roseGray text-center"
        >
          Empieza a guardar sus momentos bonitos.
        </AppText>
      </View>

      <View className="gap-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Correo"
              placeholder='Ingresa tu correo'
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
              label="Contraseña"
              placeholder='Ingresa tu contraseña'
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
              placeholder='Confirma tu contraseña'
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <AppButton
          title="Registrarme"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}
