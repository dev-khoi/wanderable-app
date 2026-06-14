import { type Href, router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wanderableTheme } from '@/constants/wanderableTheme';
import { AvatarPlaceholder, PrimaryButton, TripSummaryCard } from '@/components/wanderable';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { useLatestTripSummary } from '@/lib/trips/hooks';

const AUTOSCAN_ROUTE = '/autoscan' as Href;
const TRIP_EDIT_ROUTE = '/trip-edit' as Href;
const { colors } = wanderableTheme;

export default function TripCardScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const latestTripQuery = useLatestTripSummary();
  const latestTrip = latestTripQuery.data;

  const tripViewRoute = latestTrip
    ? ({ pathname: '/trip-view', params: { tripId: latestTrip.id } } as Href)
    : null;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background.surface }}>
      <View
        className="absolute flex-row items-center justify-between"
        style={{ top: insets.top + s(21), left: canvasLeft, width: s(375), paddingLeft: s(23), paddingRight: s(23) }}
      >
        <View className="flex-row items-center">
          <AvatarPlaceholder scale={scale} style={{ marginRight: s(7) }} />
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.primary }}>
            {(latestTrip?.ownerName ?? 'Traveler') + ','}
          </Text>
        </View>
        <SignOutButton />
      </View>

      {latestTrip ? (
        <TripSummaryCard
          coverUri={latestTrip.coverUri}
          dateLabel={latestTrip.dateRange}
          distanceLabel={latestTrip.distanceLabel}
          durationLabel={latestTrip.durationLabel}
          locationLabel={latestTrip.locationLabel}
          title={latestTrip.title}
          scale={scale}
          style={{ position: 'absolute', top: s(130), left: canvasLeft + s(23) }}
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            top: s(130),
            left: canvasLeft + s(23),
            width: s(317),
            minHeight: s(220),
            borderRadius: s(18),
            padding: s(20),
            backgroundColor: colors.surface.muted,
          }}>
          <Text className="font-extrabold" style={{ fontSize: s(22), color: colors.text.strong }}>
            {latestTripQuery.isLoading ? 'Loading your trip…' : 'No trip yet'}
          </Text>
          <Text className="mt-3 font-semibold" style={{ fontSize: s(13), lineHeight: s(19), color: colors.text.muted }}>
            {latestTripQuery.isLoading
              ? 'Pulling the latest trip from Supabase.'
              : 'Seed the database or add a trip later, then come back here to view the rebuilt story on the map.'}
          </Text>
        </View>
      )}

      {tripViewRoute ? (
        <>
          <PrimaryButton
            title="Edit trip"
            scale={scale}
            style={{
              position: 'absolute',
              top: s(502),
              left: canvasLeft + s(106),
              width: s(163),
              height: s(38),
              backgroundColor: colors.background.surface,
            }}
            textStyle={{ fontSize: s(14), color: colors.brand.secondary }}
            onPress={() => router.push(TRIP_EDIT_ROUTE)}
          />
          <PrimaryButton title="View Rebuilt Trip" scale={scale} style={{ position: 'absolute', top: s(548), left: canvasLeft + s(25), width: s(327), height: s(48) }} onPress={() => router.push(tripViewRoute)} />
        </>
      ) : null}
      <Text
        className="absolute text-center font-semibold"
        style={{ top: s(612), left: canvasLeft + s(40), width: s(295), fontSize: s(12), color: colors.text.muted }}
        onPress={() => router.replace(AUTOSCAN_ROUTE)}>
        Scan again
      </Text>
    </View>
  );
}
