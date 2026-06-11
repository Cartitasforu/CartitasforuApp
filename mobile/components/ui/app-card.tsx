import { View, ViewProps } from "react-native";
import { cn } from "@/lib/cn";

type AppCardProps = ViewProps & {
  className?: string;
};

export function AppCard({ className, ...props }: AppCardProps) {
  return (
    <View
      className={cn(
        "bg-white border border-roseBorder rounded-card p-4",
        className,
      )}
      {...props}
    />
  );
}
