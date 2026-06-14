import { Stack } from 'expo-router';

import { useAuth } from '@/lib/auth';

export default function TabLayout() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="auth"
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="autoscan"
          options={{ animation: 'fade_from_bottom' }}
        />
        
        <Stack.Screen name="trip-card" options={{ animation: 'fade' }} />
        <Stack.Screen name="trip-view" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="trip-edit"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="highlight-edit"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Protected>
    </Stack>
  );
}
