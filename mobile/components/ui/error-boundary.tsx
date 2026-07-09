import React from "react";
import { View } from "react-native";
import { AppText } from "./app-text";
import { AppButton } from "./app-button";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-bgPink p-6">
          <AppText variant="h2" className="text-wineDark mb-4">
            Algo salió mal
          </AppText>
          <AppText variant="bodyM" className="text-wineDark/70 text-center mb-6">
            {this.state.error?.message || "Ha ocurrido un error inesperado"}
          </AppText>
          <AppButton title="Reintentar" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}
