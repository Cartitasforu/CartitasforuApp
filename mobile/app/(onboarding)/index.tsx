import { AppText } from "@/components/ui/app-text";
import React, { useState } from "react";
import { View, Alert, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AppButton } from "@/components/ui/app-button";
import { useLocalSearchParams } from "expo-router";
import { completeProfile } from "@/features/auth/api/on-board";
import { useAuth } from "@/providers/AuthProvider";
import { AppInput } from "@/components/ui/app-input";
import { Controller, useForm } from "react-hook-form";
import { OnBoardidngFormData, onBoardingSchema } from "@/features/auth/schemas/on-boarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppDateInput } from "@/components/ui/app-date-input";
import { AppSelect } from "@/components/ui/app-select-input";
import { InterestsPicker } from "@/components/ui/interests-picker";
import { uploadToStorage } from "@/features/auth/api/upload-to-storage";

export default function OnboardingScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const {userId} = useLocalSearchParams<{userId: string}>()
  const {refreshProfile} = useAuth()

  const {control, handleSubmit, formState: {errors, isSubmitting}} = useForm<OnBoardidngFormData>({
    resolver: zodResolver(onBoardingSchema),
    defaultValues: {
      full_name: "",
      nickname: "",
      birth_date: undefined,
      gender: undefined,
      interests: []
    },
    mode: "onSubmit"
  })

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Se requieren permisos para acceder a la galeria");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImage(result.assets[0])
    }
  };

  const onSubmit = async (values: OnBoardidngFormData, ) => {
    try {
      const imageUrl = await uploadToStorage(image)
      await completeProfile(userId, values, imageUrl)
      await refreshProfile()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View className="flex-1 bg-bgPink px-5 pt-20">
      <View className="items-center gap-y-3">
        <AppText className="text-wineDark text-h1">Completa tu perfil</AppText>
        <AppText variant="caption" className="">
          Cuentanos un poco sobre ti
        </AppText>
        {imageUri ? (
          <TouchableOpacity className="border-roseGray" onPress={pickImage}>
            <Image
              className="rounded-full p-10 w-36 h-36"
              source={{ uri: imageUri }}
            />
            <View className="absolute w-12 h-12 bg-white rounded-full left-24 top-24 border-4 border-bgPink"></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="border-roseGray bg-white rounded-full p-10 w-32 h-32 text-center"
            onPress={pickImage}
          >
            <AppText className="text-center justify-center align-text-bottom">
              P
            </AppText>
          </TouchableOpacity>
        )}
      </View>
      <View className="gap-3">
        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Nombre completo"
              placeholder="Ingresa tu nombre completo"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.full_name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="nickname"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label="Apodo (opcional)"
              placeholder="Ingresa el apodo por el que te llama tu pareja"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.nickname?.message}
            />
          )}
        />
        <View className="flex flex-row justify-between">
          <Controller
            control={control}
            name="birth_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppDateInput
                label="Fecha de nacimiento"
                value={value}
                onChange={onChange}
                maximumDate={new Date()}
                error={errors.birth_date?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="gender"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppSelect
                label="Género"
                placeholder="Selecciona tu género"
                options={[
                  { label: "Hombre", value: "male" },
                  { label: "Mujer", value: "female" },
                  { label: "No binario", value: "non_binary" },
                  { label: "Prefiero no decirlo", value: "prefer_not_to_say" },
                ]}
                value={value}
                onChange={onChange}
                error={errors.gender?.message}
              />
            )}
          />
        </View>
        <Controller
          control={control}
          name="interests"
          render={({ field: { onChange, onBlur, value } }) => (
            <InterestsPicker
              label="Tus intereses"
              value={value}
              onChange={onChange}
              max={10}
              error={
                value.length < 3 ? "Agrega al menos tres intereses" : undefined
              }
            />
          )}
        />
      </View>
      <View>
        <AppButton
          title="Completar perfil"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
        />
      </View>
    </View>
  );
}
