import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { joinSpaceByCode } from "@/features/spaces/api/join-space";
import { useSpace } from "@/providers/SpaceProvider";
import React, { useEffect, useRef, useState } from "react";
import { TextInput, View } from "react-native";

const CODE_LENGTH = 4;

export default function SpaceScreen() {
  const { initializeSpace, refreshSpace, space } = useSpace();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [inputInvitationCode, setInputInvitationCode] = useState<string[]>(
    new Array(CODE_LENGTH).fill(""),
  );

  const inputRef = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleanCode = text.trim();

    if (cleanCode === "") {
      setInputInvitationCode((currentCode) => {
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

    setInputInvitationCode((currentCode) => {
      const nextCode = [...currentCode];
      const digits = cleanCode.slice(0, CODE_LENGTH - index).split("");

      digits.forEach((digit, offset) => {
        nextCode[index + offset] = digit;
      });

      const nextFocusIndex = Math.min(index + digits.length, CODE_LENGTH - 1);

      if (index + digits.length < CODE_LENGTH) {
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

  const handleJoinSpace = async () => {
    const code = inputInvitationCode.join("").trim();

    if (code.length !== CODE_LENGTH) {
      return;
    }

    await joinSpaceByCode(code);
    await refreshSpace();
  };

  useEffect(() => {
    let mounted = true;

    const handleCreateSpace = async () => {
      if (space?.role === "member") {
        return;
      }

      try {
        const result = await initializeSpace();
        if (mounted) {
          setInvitationCode(result.invitation_code);
        }
      } catch {
        if (mounted) {
          setInvitationCode(null);
        }
      }
    };

    handleCreateSpace();

    return () => {
      mounted = false;
    };
  }, [initializeSpace, space?.role]);

  return (
    <View className="flex-1 bg-bgPink pt-20">
      <View className="flex flex-col justify-center items-center text-center gap-4 pt-40">
        <AppText variant="display" className="text-display">
          Unete a tu espacio
        </AppText>
        <AppText className="text-roseGray text-[11px]">
          Unete con codigo o comparte tu codigo para conectar con tu pareja
        </AppText>
      </View>
      <View className="pt-20 pb-10 gap-4 justify-center text-center items-center">
        <AppText>Tu código para compartir</AppText>

        <View className="flex-row flex-wrap gap-2 items-center justify-center">
          {invitationCode?.split("").map((char, index) => (
            <View
              key={`${char}-${index}`}
              className="bg-white w-12 h-12 rounded-card items-center justify-center"
            >
              <AppText>{char}</AppText>
            </View>
          ))}
        </View>

        {!invitationCode ? (
          <AppText className="text-roseGray text-[11px]">
            Aún no hay código generado.
          </AppText>
        ) : null}
      </View>
      <View className="flex-row items-center mb-4">
        <View className="flex-1 h-[1px] bg-roseBorder" />
        <AppText className="font-body text-body-m text-roseGray mx-3">
          o
        </AppText>
        <View className="flex-1 h-[1px] bg-roseBorder" />
      </View>
      <View className="gap-2 pb-10">
        <AppText variant="h1" className="text-center">
          Unirse con código
        </AppText>
        <AppText variant="caption" className="text-center">
          Pidele a tu pareja que te comparta el código
        </AppText>
      </View>
      <View className="flex flex-row gap-3 items-center justify-center">
        {inputInvitationCode.map((value, index) => (
          <TextInput
            key={index}
            ref={(element: any) => (inputRef.current[index] = element)}
            className="w-12 h-12 rounded-card border-roseBorder bg-white text-center text-wineDark"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>
      <AppButton title="Unirse" className="mt-10 mx-10" onPress={handleJoinSpace} />
    </View>
  );
}

//E0EA
