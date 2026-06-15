import { type Href, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImmersiveStoryCard } from "@/components/trip-view/ImmersiveStoryCard";
import { TripViewHeader } from "@/components/trip-view/TripViewHeader";
import { TripViewOverlay } from "@/components/trip-view/TripViewOverlay";
import { useTripViewState } from "@/components/trip-view/useTripViewState";
import { TripMap } from "@/components/wanderable/TripMap";
import { wanderableTheme } from "@/constants/wanderableTheme";
import { useTripViewData } from "@/lib/trips/hooks";
const { colors } = wanderableTheme;

export default function TripViewScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const tripQuery = useTripViewData(tripId);
  const tripView = useTripViewState(tripQuery.data ?? null);
  const tripEditRoute = tripId
    ? ({ pathname: "/trip-edit", params: { tripId } } as Href)
    : null;

  if (tripQuery.isLoading) {
    return (
      <TripViewStatus
        body="Pulling your trip, stories, and map route from Supabase."
        title="Loading trip"
      />
    );
  }

  if (tripQuery.error) {
    return (
      <TripViewStatus
        body="We couldn't load this trip right now. Check the seeded data or try again after syncing Supabase."
        title="Trip unavailable"
      />
    );
  }

  if (!tripView.trip || !tripView.activeNode) {
    return (
      <TripViewStatus
        body="This account does not have a mapped trip yet. Seed the database first, then reopen the trip view."
        title="No trip found"
      />
    );
  }

  return (
    <View
      className="flex-1 "
      style={{ backgroundColor: colors.background.surface }}>
      <TripViewHeader
        canvasLeft={canvasLeft}
        ownerName={tripView.trip.ownerName}
        onRightPress={() => tripEditRoute && router.push(tripEditRoute)}
        rightLabel="Edit trip"
        scale={scale}
        top={insets.top}
      />

      <View
        style={{
          position: "absolute",
          top: insets.top + s(54),
          left: canvasLeft + s(2),
          width: s(371),
          height: height - insets.top - s(44),
          overflow: "hidden",
          backgroundColor: colors.map.ocean,
        }}>
        <TripMap
          activeNodeId={tripView.activeNode.id}
          allNodes={tripView.trip.nodes}
          coverImageUri={tripView.trip.coverUri}
          initialCenterCoordinate={tripView.mapInitialCenterCoordinate}
          mapContentTranslateY={-s(98)}
          nodes={tripView.trip.nodes}
          routeSegments={tripView.trip.routeSegments}
          scale={scale}
          selectedZoomLabel={tripView.selectedZoomLabel}
          tripDays={tripView.trip.days}
          onSelectNode={tripView.goToNode}
        />
      </View>

      <TripViewOverlay
        activeIndex={tripView.activeIndex}
        activeMediaUri={tripView.activeMedia?.uri ?? null}
        canvasLeft={canvasLeft}
        scale={scale}
        top={insets.top + s(58)}
        trip={tripView.trip}
        viewportWidth={width}
        zoomIndex={tripView.zoomIndex}
        onNodePress={tripView.goToNode}
        onNodeSnap={tripView.goToNodeByIndex}
        onOpenStory={tripView.openStory}
        onZoomPress={tripView.setZoomIndex}
      />

      {tripView.isStoryOpen ? (
        <View
          className="absolute"
          style={{
            top: insets.top + s(58),
            left: 0,
            right: 0,
            bottom: s(12),
            zIndex: 20,
          }}>
          <ImmersiveStoryCard
            key={tripView.activeNode.id}
            node={tripView.activeNode}
            routeSegment={tripView.activeRouteSegment}
            scale={scale}
            onClose={tripView.closeStory}
            onPrevious={tripView.goToPreviousStoryNode}
            onNext={tripView.goToNextStoryNode}
          />
        </View>
      ) : null}
    </View>
  );
}

function TripViewStatus({ body, title }: { body: string; title: string }) {
  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.background.surface }}>
      <ActivityIndicator color={colors.brand.secondary} />
      <Text
        className="mt-6 font-extrabold"
        style={{ fontSize: 22, color: colors.text.strong }}>
        {title}
      </Text>
      <Text
        className="mt-3 text-center font-semibold"
        style={{ fontSize: 13, lineHeight: 19, color: colors.text.muted }}>
        {body}
      </Text>
    </View>
  );
}
