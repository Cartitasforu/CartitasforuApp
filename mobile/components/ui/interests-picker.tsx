// components/interests-picker.tsx
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { AppText } from "./app-text";
import { cn } from "@/lib/cn";

const INTERESTS_OPTIONS = [
  "Música",
  "Viajes",
  "Cine",
  "Deportes",
  "Cocina",
  "Arte",
  "Lectura",
  "Gaming",
  "Naturaleza",
  "Fotografía",
  "Tecnología",
  "Moda",
  "Baile",
  "Yoga",
  "Mascotas",
];

type Props = {
  label?: string;
  value: string[];
  onChange: (interests: string[]) => void;
  max?: number;
  error?: string;
};

export function InterestsPicker({
  label,
  value,
  onChange,
  max = 10,
  error,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const toggle = (interest: string) => {
    if (value.includes(interest)) {
      onChange(value.filter((i) => i !== interest));
    } else {
      if (value.length < max) {
        onChange([...value, interest]);
      }
    }
  };

  const removeSelected = (interest: string) => {
    onChange(value.filter((i) => i !== interest));
  };

  return (
    <View className="gap-2">
      {label ? (
        <AppText variant="bodyM" className="pl-1.5">
          {label}
        </AppText>
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        {value.map((interest) => (
          <TouchableOpacity
            key={interest}
            onPress={() => removeSelected(interest)}
            className="flex-row items-center gap-1 rounded-full bg-primary px-4 py-2 border-wineDark"
          >
            <AppText variant="bodyM" className="text-white">
              {interest}
            </AppText>
            <AppText variant="caption" className="text-white">
              ✕
            </AppText>
          </TouchableOpacity>
        ))}

        {value.length < max && (
          <TouchableOpacity
            onPress={() => setModalOpen(true)}
            className="rounded-full border border-dashed border-roseBorder px-4 py-2"
          >
            <AppText variant="bodyM" className="text-[#8C5A6B]">
              + Agregar
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <AppText variant="caption" className="text-red-500 pl-1.5">
          {error}
        </AppText>
      ) : null}

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setModalOpen(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-2xl pb-10">
              <View className="items-center pt-3 pb-4">
                <View className="w-10 h-1 rounded-full bg-roseBorder" />
              </View>

              <AppText
                variant="bodyM"
                className="text-wineDark font-semibold px-6 pb-4"
              >
                Selecciona tus intereses
              </AppText>

              <ScrollView
                contentContainerClassName="flex-row flex-wrap gap-2 px-6 pb-4"
                showsVerticalScrollIndicator={false}
              >
                {INTERESTS_OPTIONS.map((interest) => {
                  const isSelected = value.includes(interest);
                  return (
                    <TouchableOpacity
                      key={interest}
                      onPress={() => toggle(interest)}
                      className={cn(
                        "rounded-full px-4 py-2 border",
                        isSelected
                          ? "bg-roseLight border-roseLight"
                          : "bg-white border-roseBorder",
                      )}
                    >
                      <AppText
                        variant="bodyM"
                        className={cn(
                          isSelected
                            ? "text-wineDark font-semibold"
                            : "text-[#8C5A6B]",
                        )}
                      >
                        {interest}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setModalOpen(false)}
                className="mx-6 mt-2 rounded-card bg-wineDark py-3 items-center"
              >
                <AppText variant="bodyM" className="text-white font-semibold">
                  Listo ({value.length}/{max})
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
