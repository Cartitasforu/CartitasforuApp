import { AppText } from "@/components/ui/app-text";
import React, { useState } from "react";
import { View, Alert, Image, TouchableOpacity, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { AppButton } from "@/components/ui/app-button";
import { useLocalSearchParams } from "expo-router";
import { completeProfile } from "@/features/auth/api/on-board";
import { useAuth } from "@/providers/AuthProvider";
import { AppInput } from "@/components/ui/app-input";
import { Controller, useForm } from "react-hook-form";
import {
  OnBoardidngFormData,
  onBoardingSchema,
} from "@/features/auth/schemas/on-boarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppDateInput } from "@/components/ui/app-date-input";
import { AppSelect } from "@/components/ui/app-select-input";
import { InterestsPicker } from "@/components/ui/interests-picker";
import { uploadToStorage } from "@/features/auth/api/upload-to-storage";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import {TEXTS} from "./../../constants/language/es/texts"

export default function OnboardingScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { refreshProfile } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnBoardidngFormData>({
    resolver: zodResolver(onBoardingSchema),
    defaultValues: {
      full_name: "",
      nickname: "",
      birth_date: undefined,
      gender: undefined,
      interests: [],
    },
    mode: "onSubmit",
  });

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
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImage(result.assets[0]);
    }
  };

  const onSubmit = async (values: OnBoardidngFormData) => {
    try {
      const imageUrl = await uploadToStorage(image);
      await completeProfile(userId, values, imageUrl);
      await refreshProfile();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 bg-bgPink px-5 pt-20">
      <View className="items-center gap-y-3">
        <AppText className="text-wineDark text-h1">
          {TEXTS.profile_setup.title}
        </AppText>
        <AppText variant="caption" className="">
          {TEXTS.profile_setup.subtitle}
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
            <View className="absolute w-12 h-12 bg-white rounded-full left-24 top-24 border-4 border-bgPink"></View>
          </TouchableOpacity>
        )}
        <AppText className="text-roseGray text-[11px]">
          La foto de perfil es opcional.
        </AppText>
      </View>
      <View className="gap-3">
        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <AppInput
              label={TEXTS.profile_setup.full_name_label}
              placeholder={TEXTS.profile_setup.full_name_placeholder}
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
              label={TEXTS.profile_setup.nickname_label}
              placeholder={TEXTS.profile_setup.nickname_placeholder}
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
                className="w-52"
                label={TEXTS.profile_setup.birthdate_label}
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
                className="w-52"
                label={TEXTS.profile_setup.gender_label}
                placeholder={TEXTS.profile_setup.gender_placeholder}
                options={[
                  {
                    label: TEXTS.profile_setup.gender_options.male,
                    value: "male",
                  },
                  {
                    label: TEXTS.profile_setup.gender_options.female,
                    value: "female",
                  },
                  {
                    label: TEXTS.profile_setup.gender_options.non_binary,
                    value: "non_binary",
                  },
                  {
                    label: TEXTS.profile_setup.gender_options.prefer_not_to_say,
                    value: "prefer_not_to_say",
                  },
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
              label={TEXTS.profile_setup.interests_label}
              value={value}
              onChange={onChange}
              max={10}
              error={
                value.length < 3
                  ? TEXTS.profile_setup.interests_min_hint
                  : undefined
              }
            />
          )}
        />
      </View>
      <View className="">
        <View>
          <AppCheckbox
            label={TEXTS.profile_setup.terms_checkbox}
            checked={acceptTerms}
            onChange={() => setAcceptTerms(!acceptTerms)}
          />
          <Pressable
            className="ml-9" //onPress={()=>router.push("/terms")}
          >
            <AppText className="text-primaryDeep underline underline-offset-2">
              {TEXTS.profile_setup.terms_link}
            </AppText>
          </Pressable>
        </View>
        <AppButton
          title={TEXTS.profile_setup.complete_button}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-2"
          disabled={acceptTerms === false}
        />
      </View>
    </View>
  );
}
