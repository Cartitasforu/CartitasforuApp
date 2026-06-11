import AuthProvider from "@/providers/AuthProvider";
import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <AuthProvider>
    <Stack screenOptions={{headerShown: false}}/>
  </AuthProvider>
  )
}
