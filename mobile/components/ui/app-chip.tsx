import { View, ViewProps } from "react-native";
import { AppText } from "./app-text";
import { cn } from "@/lib/cn";

type ChipVariant = "pink" | "lavender" | "peach";

const chipVariants: Record<ChipVariant, string> = {
  pink: "bg-primaryMid/30",
  lavender: "bg-lavender",
  peach: "bg-peach",
};

type AppChipProps = ViewProps & {
  label: string;
  variant?: ChipVariant;
  className?: string;
};

export function AppChip({
  label,
  variant = "pink",
  className,
  ...props
}: AppChipProps) {
  return (
    <View
      className={cn(
        "self-start px-3 py-1 rounded-pill",
        chipVariants[variant],
        className,
      )}
      {...props}
    >
      <AppText variant="tiny" className="text-roseGray">
        {label}
      </AppText>
    </View>
  );
}
