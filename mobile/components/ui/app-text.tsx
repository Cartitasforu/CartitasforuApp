import { cn } from '@/lib/cn';
import React from 'react'
import { Text, TextProps } from "react-native";

type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "bodyL"
  | "bodyM"
  | "button"
  | "label"
  | "caption"
  | "tiny";

  const variantClasses: Record<TextVariant, string> = {
    display: "font-display text-display text-wineDark",
    h1: "font-display text-h1 text-wineDark",
    h2: "font-display text-h2 text-wineDark",
    h3: "font-display text-h3 text-wineDark",
    bodyL: "font-body text-body-l text-wineDark",
    bodyM: "font-body text-body-m text-wineDark",
    button: "font-bodyMedium text-button text-white",
    label: "font-bodyMedium text-label tracking-label uppercase text-roseGray",
    caption: "font-body text-caption text-roseGray",
    tiny: "font-bodyMedium text-tiny text-roseGray",
  };

  type AppTextProps = TextProps & {
    variant?: TextVariant;
    className?: string;
  };

export const AppText = ({
    variant = "bodyM",
    className,
    ...props
}:AppTextProps) => {
  return (
    <Text className={cn(variantClasses[variant], className)} {...props} />
  )
}
