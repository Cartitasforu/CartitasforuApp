// components/app-select.tsx
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "./app-text";
import { cn } from "@/lib/cn";

type Option<T extends string = string> = {
  label: string;
  value: T;
};

type Props<T extends string = string> = {
  label?: string;
  error?: string;
  placeholder?: string;
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
};

export function AppSelect<T extends string = string>({
  label,
  error,
  placeholder = "Selecciona una opción",
  options,
  value,
  onChange,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1">
      {label ? (
        <AppText variant="bodyM" className="pl-1.5">
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          "min-h-touch rounded-card border bg-white px-4",
          "flex-row items-center justify-between",
          error ? "border-red-400" : "border-roseBorder",
          className,
        )}
      >
        <AppText
          variant="bodyM"
          className={cn(selected ? "text-wineDark" : "text-[#8C5A6B]")}
        >
          {selected?.label ?? placeholder}
        </AppText>

        <AppText variant="bodyM" className="text-[#8C5A6B]">
          {open ? "▲" : "▼"}
        </AppText>
      </Pressable>

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setOpen(false)}
        >
          {/* stopPropagation para que tocar la lista no cierre el modal */}
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View className="bg-white rounded-t-2xl pb-8">
              {/* handle */}
              <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1 rounded-full bg-roseBorder" />
              </View>

              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                ItemSeparatorComponent={() => (
                  <View className="h-px bg-roseBorder/30 mx-4" />
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "px-6 py-4 flex-row items-center justify-between",
                      item.value === value ? "bg-rose-50" : "",
                    )}
                  >
                    <AppText
                      variant="bodyM"
                      className={cn(
                        item.value === value
                          ? "text-wineDark font-semibold"
                          : "text-wineDark",
                      )}
                    >
                      {item.label}
                    </AppText>

                    {item.value === value ? (
                      <AppText variant="bodyM" className="text-wineDark">
                        ✓
                      </AppText>
                    ) : null}
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
