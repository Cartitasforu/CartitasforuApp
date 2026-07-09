import { AppButton } from "@/components/ui/app-button";
import { AppText } from "@/components/ui/app-text";
import { joinSpaceByCode } from "@/features/spaces/api/join-space";
import { useCodeInput } from "@/hooks/useCodeInput";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useSpace } from "@/providers/SpaceProvider";
import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";

const CODE_LENGTH = 4;

export default function SpaceScreen() {
  const { initializeSpace, refreshSpace, space } = useSpace();
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const { code: inputInvitationCode, inputRef, handleChange } = 
    useCodeInput(CODE_LENGTH, (text) => text.trim());
  const { handleError } = useErrorHandler();

  const handleJoinSpace = async () => {
    const code = inputInvitationCode.join("").trim();

    if (code.length !== CODE_LENGTH) {
      return;
    }

    try {
      await joinSpaceByCode(code);
      await refreshSpace();
    } catch (error) {
      handleError(error);
    }
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
