import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  TripCardEmptyState,
  TripCardHeader,
  TripSwipeCard,
} from "@/components/trip-card";
import { TripMap } from "@/components/wanderable/TripMap";
import { wanderableTheme } from "@/constants/wanderableTheme";
import { useDeleteTrip, useTripSummaries } from "@/lib/trips/hooks";

const { colors } = wanderableTheme;
const SHEET_SPRING = {
  damping: 20,
  stiffness: 220,
  mass: 0.28,
};

function clamp(value: number, min: number, max: number) {
  "worklet";

  return Math.min(Math.max(value, min), max);
}

export default function TripCardScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const tripsQuery = useTripSummaries();
  const deleteTripMutation = useDeleteTrip();
  const trips = tripsQuery.data ?? [];
  const expandedTop = insets.top + s(88);
  const defaultTop = Math.max(insets.top + s(136), height * 0.3);
  const collapsedTop = Math.max(defaultTop + s(28), height * 0.7);
  const maxOffset = collapsedTop - expandedTop;
  const defaultOffset = defaultTop - expandedTop;
  const startOffset = useSharedValue(defaultOffset);
  const sheetOffset = useSharedValue(defaultOffset);
  const cardWidth = width - s(40);
  const globeExpandedTranslateY = -s(200);
  const globeCollapsedTranslateY = -s(106);
  const globeRevealThreshold = 0.18;
  const globeNodes = useMemo(
    () =>
      trips.flatMap((trip) =>
        Array.isArray(trip.nodes) ? trip.nodes.filter(Boolean) : [],
      ),
    [trips],
  );
  const globeRouteSegments = useMemo(
    () =>
      trips.flatMap((trip) =>
        Array.isArray(trip.routeSegments)
          ? trip.routeSegments.filter(Boolean)
          : [],
      ),
    [trips],
  );

  const ownerName = trips[0]?.ownerName ?? "Traveler";

  const openTrip = (targetTripId: string) => {
    router.push({
      pathname: "/trip-view",
      params: { tripId: targetTripId },
    });
  };

  const confirmDeleteTrip = (tripId: string, tripTitle: string) => {
    Alert.alert("Delete trip?", tripTitle, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTripMutation.mutate({ tripId });
        },
      },
    ]);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      startOffset.value = sheetOffset.value;
    })
    .onUpdate((event) => {
      sheetOffset.value = clamp(
        startOffset.value + event.translationY,
        0,
        maxOffset,
      );
    })
    .onEnd((event) => {
      const projectedOffset = clamp(
        sheetOffset.value + event.velocityY * 0.08,
        0,
        maxOffset,
      );
      const snapOffsets = [0, defaultOffset, maxOffset];
      let nextOffset = snapOffsets[0];

      for (const offset of snapOffsets) {
        if (
          Math.abs(offset - projectedOffset) <
          Math.abs(nextOffset - projectedOffset)
        ) {
          nextOffset = offset;
        }
      }

      sheetOffset.value = withSpring(nextOffset, SHEET_SPRING);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetOffset.value }],
  }));
  const globeStyle = useAnimatedStyle(() => {
    const progress = maxOffset === 0 ? 0 : sheetOffset.value / maxOffset;
    const reveal = clamp(progress / globeRevealThreshold, 0, 1);

    return {
      opacity: reveal,
      transform: [
        {
          translateY:
            globeExpandedTranslateY +
            (globeCollapsedTranslateY - globeExpandedTranslateY) * progress,
        },
      ],
    };
  });

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.deepSpace }}>
      <Animated.View className="absolute inset-0" style={globeStyle}>
        <TripMap
          activeNodeId=""
          allNodes={globeNodes}
          allowGlobeSpin
          initialCenterCoordinate={null}
          lockGlobe
          markerVariant="compact"
          nodes={globeNodes}
          routeSegments={globeRouteSegments}
          scale={scale}
          selectedZoomLabel="Globe"
          showRouteLabels={false}
          tripDays={[]}
          onSelectNode={() => undefined}
        />
      </Animated.View>

      <View
        className="absolute inset-0"
        pointerEvents="none"
        style={{ backgroundColor: "rgba(5, 8, 20, 0.08)" }}
      />

      <Animated.View
        className="absolute left-0 right-0 overflow-hidden"
        style={[
          {
            top: expandedTop,
            bottom: 0,
            borderTopLeftRadius: s(32),
            borderTopRightRadius: s(32),
            backgroundColor: "rgba(255,255,255,0.96)",
            shadowColor: colors.shadow.default,
            shadowOpacity: 0.22,
            shadowOffset: { width: 0, height: -8 },
            shadowRadius: s(20),
            elevation: 18,
          },
          sheetStyle,
        ]}>
        <GestureDetector gesture={gesture}>
          <View
            className="items-center"
            style={{ paddingTop: s(12), paddingBottom: s(10) }}>
            <View
              style={{
                width: s(54),
                height: s(6),
                borderRadius: s(999),
                backgroundColor: colors.surface.avatarFill,
              }}
            />
          </View>
        </GestureDetector>

        <TripCardHeader ownerName={ownerName} scale={scale} />

        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-center self-start"
          style={{
            marginTop: s(4),
            marginLeft: s(20),
            marginBottom: s(16),
            paddingHorizontal: s(16),
            height: s(42),
            borderRadius: s(999),
            backgroundColor: colors.brand.secondary,
          }}
          onPress={() => router.push("/trip-import")}>
          <Text
            className="font-extrabold"
            style={{ fontSize: s(14), color: colors.text.inverse }}>
            + Add trip
          </Text>
        </Pressable>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingTop: s(2),
            paddingBottom: s(20),
            paddingHorizontal: s(20),
          }}
          showsVerticalScrollIndicator={false}>
          {trips.length ? (
            trips.map((trip) => (
              <View key={trip.id} style={{ marginBottom: s(16) }}>
                <TripSwipeCard
                  active
                  cardWidth={cardWidth}
                  isFirst
                  isDeleting={deleteTripMutation.isPending}
                  onDelete={() => confirmDeleteTrip(trip.id, trip.title)}
                  scale={scale}
                  spacing={0}
                  trip={trip}
                  onPress={() => openTrip(trip.id)}
                />
              </View>
            ))
          ) : (
            <TripCardEmptyState isLoading={tripsQuery.isLoading} scale={scale} />
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
