import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router'
import React from 'react'

export default function AuthLayout() {
  const { loading, session } = useAuth();

  if (loading) return null;

  if (session) {
    return <Redirect href="/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
