import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { cn } from "@/lib/cn";
import { AppText } from "./app-text";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
};

export function AppInput({
  label,
  error,
  className,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
  secureTextEntry,
  ...props
}: Props) {
  return (
    <View className="gap-1">
      {label ? <AppText variant="bodyM" className="pl-1.5">{label}</AppText> : null}

      <View className="relative justify-center">
        <TextInput
          className={cn(
            "min-h-touch rounded-card border border-roseBorder bg-white px-4",
            showPasswordToggle ? "pr-16" : "pr-4",
            "font-body text-body-m text-wineDark",
            className,
          )}
          placeholderTextColor="#8C5A6B"
          secureTextEntry={showPasswordToggle ? !passwordVisible : secureTextEntry}
          {...props}
        />

        {showPasswordToggle ? (
          <Pressable
            onPress={onTogglePassword}
            className="absolute bottom-0 right-3 top-0 justify-center"
            hitSlop={8}
          >
            <AppText variant="tiny" className="text-primaryDeep leading-none">
              {passwordVisible ? "Ocultar" : "Mostrar"}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" className="text-red-500">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
