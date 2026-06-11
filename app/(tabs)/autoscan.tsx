import { type Href, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';

import { wanderableTheme } from '@/constants/wanderableTheme';

const SPACE_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/9bb390da-3cf1-471b-800a-1d6dc0935410';
const EARTH_IMAGE_URI = 'https://www.figma.com/api/mcp/asset/186b4921-5d0c-4748-951c-961065493367';
const TRIP_CARD_ROUTE = '/trip-card' as Href;
const { colors } = wanderableTheme;

export default function AutoscanScreen() {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef(false);

  const goToTripCard = () => {
    if (hasNavigatedRef.current) {
      return;
    }

    hasNavigatedRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    router.replace(TRIP_CARD_ROUTE);
  };

  useEffect(() => {
    timerRef.current = setTimeout(goToTripCard, 2200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background.deepSpace }}>
      <Image source={{ uri: SPACE_IMAGE_URI }} className="absolute inset-0" resizeMode="cover" />
      <View className="absolute inset-0" style={{ backgroundColor: colors.overlay.spaceScrim }} />
      <Image source={{ uri: EARTH_IMAGE_URI }} className="absolute top-0" style={{ left: canvasLeft + s(-87), width: s(548), height: s(309) }} resizeMode="cover" />
      <View className="absolute items-center" style={{ top: s(285), left: canvasLeft + s(24), width: s(327), height: s(322), borderRadius: s(78), backgroundColor: colors.surface.muted }}>
        <Text className="absolute text-center font-extrabold" style={{ top: s(86), fontSize: s(28), lineHeight: s(34), color: colors.text.primary }}>Scanning trip</Text>
        <Pressable
          accessibilityRole="button"
          className="absolute"
          style={{ top: s(153), paddingHorizontal: s(16), paddingVertical: s(8) }}
          onPress={goToTripCard}
        >
          <Text className="font-semibold" style={{ fontSize: s(14), color: colors.text.subtle }}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
