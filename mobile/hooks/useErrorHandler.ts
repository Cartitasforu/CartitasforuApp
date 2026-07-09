import { useCallback } from "react";
import { Alert } from "react-native";

type ErrorHandlerOptions = {
  title?: string;
  showAlert?: boolean;
  onError?: (error: Error) => void;
};

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const { title = "Error", showAlert = true, onError } = options;

  const handleError = useCallback(
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Ha ocurrido un error inesperado";

      console.error(`${title}:`, message);

      if (onError && error instanceof Error) {
        onError(error);
      }

      if (showAlert) {
        Alert.alert(title, message, [{ text: "OK" }]);
      }
    },
    [title, showAlert, onError],
  );

  return { handleError };
}
