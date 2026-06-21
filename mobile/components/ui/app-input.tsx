import { TextInput, TextInputProps, View } from "react-native";
import { cn } from "@/lib/cn";
import { AppText } from "./app-text";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
};

export function AppInput({ label, error, className, ...props }: Props) {
  return (
    <View className="gap-1">
      {label ? <AppText variant="bodyM" className="pl-1.5">{label}</AppText> : null}

      <TextInput
        className={cn(
          "min-h-touch rounded-card border border-roseBorder bg-white px-4",
          "font-body text-body-m text-wineDark",
          className,
        )}
        placeholderTextColor="#8C5A6B"
        {...props}
      />

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
