import { Pressable, PressableProps, ActivityIndicator } from "react-native";
import { AppText } from "./app-text";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary active:bg-primaryDeep",
  secondary: "bg-white border border-roseBorder active:bg-bgSoft",
  ghost: "bg-transparent active:bg-bgSoft",
};

const textVariants: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-primaryDeep",
  ghost: "text-primaryDeep",
};

const sizeVariants: Record<ButtonSize, string> = {
  md: "min-h-button px-5 rounded-pill",
  lg: "min-h-button px-6 rounded-pill",
};

type AppButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
};

export function AppButton({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: AppButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={cn(
        "items-center justify-center flex-row",
        buttonVariants[variant],
        sizeVariants[size],
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#C9477E"}
        />
      ) : (
        <AppText variant="button" className={textVariants[variant]}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
