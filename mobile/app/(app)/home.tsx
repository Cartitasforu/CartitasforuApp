import { logOut } from '@/features/auth/api/log-out';
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export default function HomeScreen () {

  const onLogOut = async () => {
    await logOut()
  }
  return (
    <View>
      <Text>home</Text>
      <Pressable onPress={onLogOut}>
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
