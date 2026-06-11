import { type Href, router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wanderableTheme } from '@/constants/wanderableTheme';
import { AvatarPlaceholder, NotificationBell, PrimaryButton, TripSummaryCard } from '@/components/wanderable';

const AUTOSCAN_ROUTE = '/autoscan' as Href;
const TRIP_VIEW_ROUTE = '/trip-view' as Href;
const { colors } = wanderableTheme;

export default function TripCardScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background.surface }}>
      <View
        className="absolute flex-row items-center justify-between"
        style={{ top: insets.top + s(21), left: canvasLeft, width: s(375), paddingLeft: s(23), paddingRight: s(23) }}
      >
        <View className="flex-row items-center">
          <AvatarPlaceholder scale={scale} style={{ marginRight: s(7) }} />
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.primary }}>Jihan Audy,</Text>
        </View>
        <NotificationBell scale={scale} />
      </View>

      <TripSummaryCard scale={scale} style={{ position: 'absolute', top: s(130), left: canvasLeft + s(23) }} />

      <PrimaryButton title="View Rebuilt Trip" scale={scale} style={{ position: 'absolute', top: s(548), left: canvasLeft + s(25), width: s(327), height: s(48) }} onPress={() => router.push(TRIP_VIEW_ROUTE)} />
      <Text
        className="absolute text-center font-semibold"
        style={{ top: s(612), left: canvasLeft + s(40), width: s(295), fontSize: s(12), color: colors.text.muted }}
        onPress={() => router.replace(AUTOSCAN_ROUTE)}>
        Scan again
      </Text>
    </View>
  );
}
