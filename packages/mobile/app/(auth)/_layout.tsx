import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#0f0f1a',
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: '登录' }} />
      <Stack.Screen name="register" options={{ title: '注册' }} />
    </Stack>
  );
}