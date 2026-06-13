import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImmersiveStoryCard } from "@/components/trip-view/ImmersiveStoryCard";
import { TripViewHeader } from "@/components/trip-view/TripViewHeader";
import { TripViewOverlay } from "@/components/trip-view/TripViewOverlay";
import { useTripViewState } from "@/components/trip-view/useTripViewState";
import { TripMap } from "@/components/wanderable/TripMap";
import { wanderableTheme } from "@/constants/wanderableTheme";
const { colors } = wanderableTheme;

export default function TripViewScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const tripView = useTripViewState();

  return (
    <View
      className="flex-1 "
      style={{ backgroundColor: colors.background.surface }}>
        
      <TripViewHeader
        canvasLeft={canvasLeft}
        ownerName={tripView.trip.ownerName}
        scale={scale}
        top={insets.top}
      />

      <View
        style={{
          position: "absolute",
          top: insets.top + s(44),
          left: canvasLeft + s(2),
          width: s(371),
          height: height - insets.top - s(44),
          overflow: "hidden",
          backgroundColor: colors.map.ocean,
        }}>
        <TripMap
          activeNodeId={tripView.activeNode.id}
          allNodes={tripView.trip.nodes}
          initialCenterCoordinate={tripView.mapInitialCenterCoordinate}
          nodes={tripView.trip.nodes}
          routeSegments={tripView.trip.routeSegments}
          scale={scale}
          selectedZoomLabel={tripView.selectedZoomLabel}
          onSelectNode={tripView.goToNode}
        />
      </View>

      <TripViewOverlay
        activeIndex={tripView.activeIndex}
        activeMediaUri={tripView.activeMedia.uri}
        activeNode={tripView.activeNode}
        canvasLeft={canvasLeft}
        scale={scale}
        selectedDayId={tripView.selectedDayId}
        top={insets.top + s(58)}
        trip={tripView.trip}
        zoomIndex={tripView.zoomIndex}
        onDayPress={tripView.goToDay}
        onNodePress={tripView.goToNode}
        onOpenStory={tripView.openStory}
        onSelectAllDays={() => tripView.setSelectedDayId("all")}
        onZoomPress={tripView.setZoomIndex}
        onPreviousNode={tripView.goToPreviousNode}
        onNextNode={tripView.goToNextNode}
      />

      {tripView.isStoryOpen ? (
        <View
          className="absolute"
          style={{
            top: insets.top + s(78),
            left: canvasLeft + s(23),
            width: s(329),
            bottom: s(19),
            zIndex: 20,
          }}>
          <ImmersiveStoryCard
            node={tripView.activeNode}
            scale={scale}
            onClose={tripView.closeStory}
            onPrevious={tripView.goToPreviousNode}
            onNext={tripView.goToNextNode}
          />
        </View>
      ) : null}
    </View>
  );
}
