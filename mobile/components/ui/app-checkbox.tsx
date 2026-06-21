// components/ui/app-checkbox.tsx
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { cn } from "@/lib/cn";
import { AppText } from "./app-text";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function AppCheckbox({
  checked,
  onChange,
  label,
  error,
  disabled = false,
  className,
}: Props) {
  return (
    <View className={cn("gap-1", className)}>
      <Pressable
        onPress={() => !disabled && onChange(!checked)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        className="flex-row items-center gap-3"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View
          className={cn(
            "w-5 h-5 rounded items-center justify-center border",
            checked
              ? "bg-[#C9477E] border-[#C9477E]"
              : "bg-white border-[#FF6B8B]",
            error && !checked && "border-red-400",
            disabled && "opacity-50"
          )}
        >
          {checked && (
            <Feather name="check" size={12} color="white" />
          )}
        </View>

        {label && (
          <AppText
            variant="bodyM"
            className={cn(
              "flex-1",
              disabled ? "text-[#8C5A6B]/50" : "text-[#3D2030]"
            )}
          >
            {label}
          </AppText>
        )}
      </Pressable>

      {error && (
        <AppText variant="caption" className="text-red-500 pl-8">
          {error}
        </AppText>
      )}
    </View>
  );
}