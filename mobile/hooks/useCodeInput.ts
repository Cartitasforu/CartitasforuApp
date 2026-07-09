import { useRef, useState } from "react";
import { TextInput } from "react-native";

export function useCodeInput(length: number, cleanFn?: (text: string) => string) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""));
  const inputRef = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleanCode = cleanFn ? cleanFn(text) : text.replace(/[^0-9]/g, "");

    if (cleanCode === "") {
      setCode((currentCode) => {
        const nextCode = [...currentCode];
        const hadValue = nextCode[index] !== "";
        nextCode[index] = "";

        if (hadValue && index > 0) {
          setTimeout(() => {
            inputRef.current[index - 1]?.focus();
          }, 10);
        }

        return nextCode;
      });
      return;
    }

    setCode((currentCode) => {
      const nextCode = [...currentCode];
      const digits = cleanCode.slice(0, length - index).split("");

      digits.forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });

      const nextFocusIndex = Math.min(index + digits.length, length - 1);

      if (index + digits.length < length) {
        setTimeout(() => {
          inputRef.current[index + digits.length]?.focus();
        }, 10);
      } else {
        setTimeout(() => {
          inputRef.current[nextFocusIndex]?.blur();
        }, 10);
      }

      return nextCode;
    });
  };
  
  return { code, inputRef, handleChange, fullCode: code.join("") };
}