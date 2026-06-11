import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="auth"
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
      <Stack.Screen name="autoscan" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="trip-card" options={{ animation: 'fade' }} />
    </Stack>
  );
}
