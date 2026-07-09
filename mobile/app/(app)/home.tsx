import { logOut } from '@/features/auth/api/log-out';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Pressable, Text, View } from 'react-native'

export default function HomeScreen () {
  const { handleError } = useErrorHandler();

  const onLogOut = async () => {
    try {
      await logOut()
    } catch (error) {
      handleError(error);
    }
  }
  return (
    <View className='mt-20 ml-10'>
      <Text>home</Text>
      <Pressable onPress={onLogOut}>
        <Text>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
