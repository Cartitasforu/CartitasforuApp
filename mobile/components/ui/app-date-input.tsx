// components/app-date-input.tsx
import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { AppText } from "./app-text";
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  error?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  className?: string;
};

export function AppDateInput({
  label,
  error,
  value,
  onChange,
  maximumDate,
  minimumDate,
  className,
}: Props) {
  const [show, setShow] = useState(false);

  // ← normalización defensiva
  const dateValue = value instanceof Date ? value : null;

  const formatted = dateValue
    ? dateValue.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (selected instanceof Date) onChange(selected); // ← solo Date reales
  };

  return (
    <View className="gap-1">
      {label ? (
        <AppText variant="bodyM" className="pl-1.5">
          {label}
        </AppText>
      ) : null}

      <Pressable
        onPress={() => setShow(true)}
        className={cn(
          "min-h-touch rounded-card border border-roseBorder bg-white px-4",
          "flex-row items-center justify-between",
          error ? "border-red-400" : "border-roseBorder",
          className,
        )}
      >
        <AppText
          variant="bodyM"
          className={cn(formatted ? "text-wineDark" : "text-[#8C5A6B]")}
        >
          {formatted ?? "DD/MM/AAAA"}
        </AppText>

        <AppText variant="bodyM" className="text-[#8C5A6B]">
          📅
        </AppText>
      </Pressable>

      {show && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={dateValue ?? new Date()} // ← fallback a hoy si no hay fecha
          maximumDate={maximumDate ?? new Date()}
          minimumDate={minimumDate}
          onChange={handleChange}
          locale="es-CO"
        />
      )}

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
