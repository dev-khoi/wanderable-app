import { type Href, router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ActionButton,
  EditableTitleCard,
  EditHeader,
  EditSheet,
  HighlightCard,
  MetaPill,
  RouteConnector,
  SectionHeading,
} from "@/components/trip-edit";
import { wanderableTheme } from "@/constants/wanderableTheme";
import {
  type MediaItem,
  type RouteSegment,
  type TripNode,
  updateMockTrip,
  useMockTrip,
} from "@/lib/mockData";

const TRIP_VIEW_ROUTE = "/trip-view" as Href;
const { colors } = wanderableTheme;

export default function TripEditScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const trip = useMockTrip();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const [selectedNodeId, setSelectedNodeId] = useState(trip.nodes[0]?.id ?? "");
  const selectedNode =
    trip.nodes.find((node) => node.id === selectedNodeId) ?? trip.nodes[0];
  const unresolvedMissingMedia = useMemo(
    () =>
      trip.missingGpsMedia.filter(
        (media) => media.placementStatus === "missing_location",
      ),
    [trip.missingGpsMedia],
  );
  const skippedMissingCount = useMemo(
    () =>
      trip.missingGpsMedia.filter(
        (media) => media.placementStatus === "skipped",
      ).length,
    [trip.missingGpsMedia],
  );

  useEffect(() => {
    if (!trip.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(trip.nodes[0]?.id ?? "");
    }
  }, [selectedNodeId, trip.nodes]);

  const moveMissingMediaToNode = (media: MediaItem) => {
    if (!selectedNode) {
      return;
    }

    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      missingGpsMedia: currentTrip.missingGpsMedia.filter(
        (item) => item.id !== media.id,
      ),
      nodes: currentTrip.nodes.map((node) => {
        if (node.id !== selectedNode.id) {
          return node;
        }

        const mediaWithGps = {
          ...media,
          hasGps: true,
          placementStatus: "placed" as const,
        };
        const nextMedia = [...node.media, mediaWithGps].sort((a, b) =>
          a.takenAt.localeCompare(b.takenAt),
        );

        return {
          ...node,
          media: nextMedia,
          photoCount: nextMedia.length,
        };
      }),
    }));
  };

  const skipMissingMedia = (mediaId: string) => {
    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      missingGpsMedia: currentTrip.missingGpsMedia.map((media) =>
        media.id === mediaId ? { ...media, placementStatus: "skipped" } : media,
      ),
    }));
  };

  const moveHighlight = (nodeId: string, direction: -1 | 1) => {
    const currentIndex = trip.nodes.findIndex((node) => node.id === nodeId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= trip.nodes.length) {
      return;
    }

    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      nodes: moveListItem(currentTrip.nodes, currentIndex, nextIndex),
      routeSegments: rebuildRouteSegments(
        moveListItem(currentTrip.nodes, currentIndex, nextIndex),
        currentTrip.routeSegments,
      ),
    }));
    setSelectedNodeId(nodeId);
  };

  const setTripCover = (nodeId: string) => {
    const node = trip.nodes.find((item) => item.id === nodeId);
    const coverUri = node?.media[0]?.uri ?? trip.coverUri;
    updateMockTrip((currentTrip) => ({ ...currentTrip, coverUri }));
  };

  const addHighlight = () => {
    const anchorNode = trip.nodes[trip.nodes.length - 1] ?? selectedNode;
    const nextIndex = trip.nodes.length + 1;

    if (!anchorNode) {
      return;
    }

    const newNode: TripNode = {
      ...anchorNode,
      id: `node-added-${nextIndex}`,
      title: `New highlight ${nextIndex}`,
      locationName: anchorNode.locationName,
      timeRange: "Time TBD",
      mapPoint: {
        x: Math.min(94, anchorNode.mapPoint.x + 6),
        y: Math.min(90, anchorNode.mapPoint.y + 4),
      },
      coordinate: [
        anchorNode.coordinate[0] + 0.02,
        anchorNode.coordinate[1] + 0.015,
      ],
      photoCount: 0,
      blog: "Add the summary that should carry this highlight on the map.",
      media: [],
      voiceNoteSeconds: undefined,
    };

    updateMockTrip((currentTrip) => {
      const nextNodes = [...currentTrip.nodes, newNode];

      return {
        ...currentTrip,
        nodes: nextNodes,
        routeSegments: rebuildRouteSegments(
          nextNodes,
          currentTrip.routeSegments,
        ),
      };
    });

    setSelectedNodeId(newNode.id);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#D6D3DB" }}>
      <View
        className="absolute left-0 right-0 top-0"
        style={{ height: insets.top + s(228), backgroundColor: "#D1CED6" }}>
        <Image
          source={{ uri: trip.coverUri }}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(28, 18, 67, 0.14)" }}
        />
      </View>
      <EditHeader
        title="edit"
        top={insets.top}
        onBack={() => router.replace(TRIP_VIEW_ROUTE)}
        scale={scale}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + s(86),
          paddingBottom: s(32),
          minHeight: height,
        }}>
        <View style={{ height: s(86) }} />
        <EditSheet
          style={{
            minHeight: height - insets.top - s(88),
            paddingHorizontal: s(20),
            paddingTop: s(26),
            paddingBottom: s(32),
          }}>
          <EditableTitleCard
            helper="Trip name"
            meta="Tap to rename it. The map and share views should inherit this title directly."
            value={trip.title}
            scale={scale}
            onChangeText={(title) =>
              updateMockTrip((currentTrip) => ({ ...currentTrip, title }))
            }
          />

          <View className="mt-4 flex-row flex-wrap" style={{ gap: s(10) }}>
            <MetaPill label="Dates" value={trip.dateRange} scale={scale} />
            <MetaPill label="Length" value={trip.durationLabel} scale={scale} />
            <MetaPill
              label="Distance"
              value={trip.distanceLabel}
              scale={scale}
            />
          </View>

          {/* no need for this */}
          {/* <View style={{ marginTop: s(28) }}>
            <SectionHeading
              body="Trip edit stays lightweight here: set the title, pick the trip cover, adjust highlight order, then jump into each highlight to curate the story photos."
              title="Highlights"
              scale={scale}
            />
          </View> */}

          <View style={{ marginTop: s(18), gap: s(4) }}>
            {trip.nodes.map((node, index) => {
              const day = trip.days.find((item) => item.id === node.dayId);
              const nextSegment = trip.routeSegments.find(
                (segment) => segment.fromNodeId === node.id,
              );
              const isSelected = node.id === selectedNode?.id;

              return (
                <View key={node.id}>
                  <HighlightCard
                    active={isSelected}
                    coverUri={node.media[0]?.uri ?? null}
                    dateLabel={day ? `${day.label} • ${day.date}` : undefined}
                    locationName={node.locationName}
                    timeRange={node.timeRange}
                    title={node.title}
                    scale={scale}
                    onPress={() => setSelectedNodeId(node.id)}
                    onEditStories={() =>
                      router.push({
                        pathname: "/highlight-edit",
                        params: { nodeId: node.id },
                      })
                    }
                    onMoveEarlier={
                      index > 0 ? () => moveHighlight(node.id, -1) : undefined
                    }
                    onMoveLater={
                      index < trip.nodes.length - 1
                        ? () => moveHighlight(node.id, 1)
                        : undefined
                    }
                    onSetCover={() => setTripCover(node.id)}
                  />
                  {nextSegment ? (
                    <RouteConnector
                      transport={nextSegment.transport}
                      scale={scale}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: s(18) }}>
            <ActionButton
              title="+ Add highlight"
              onPress={addHighlight}
              scale={scale}
            />
          </View>

          <View style={{ marginTop: s(30) }}>
            <SectionHeading
              body="Photos without a location never block the trip. Add them to the selected highlight when you know where they belong, or skip them for now."
              title="Missing location inbox"
              scale={scale}
            />
          </View>

          <View
            className="mt-4 rounded-[24px] bg-[#F6F4F8]"
            style={{ padding: s(14) }}>
            <Text
              className="font-semibold"
              style={{ fontSize: s(12), color: colors.text.muted }}>
              Selected highlight
            </Text>
            <Text
              className="mt-1 font-extrabold"
              style={{ fontSize: s(16), color: colors.text.primary }}>
              {selectedNode?.title ?? "No highlight selected"}
            </Text>
            <Text
              className="mt-2 font-semibold"
              style={{ fontSize: s(11), color: colors.text.muted }}>
              {skippedMissingCount > 0
                ? `${skippedMissingCount} skipped item${skippedMissingCount === 1 ? "" : "s"} will stay off-map until you revisit them.`
                : "Skipped items stay out of the public trip until you place them."}
            </Text>
          </View>

          <View style={{ marginTop: s(14), gap: s(12) }}>
            {unresolvedMissingMedia.length === 0 ? (
              <View
                className="rounded-[24px] bg-white"
                style={{
                  padding: s(16),
                  borderWidth: 1,
                  borderColor: colors.surface.cardBorder,
                }}>
                <Text
                  className="font-extrabold"
                  style={{ fontSize: s(14), color: colors.text.primary }}>
                  All unresolved photos are handled.
                </Text>
                <Text
                  className="mt-2 font-semibold"
                  style={{
                    fontSize: s(12),
                    lineHeight: s(18),
                    color: colors.text.muted,
                  }}>
                  You can keep refining highlight order, or open a highlight to
                  tighten its photo sequence.
                </Text>
              </View>
            ) : (
              unresolvedMissingMedia.map((media) => (
                <View
                  key={media.id}
                  className="flex-row rounded-[24px] bg-white"
                  style={{
                    padding: s(12),
                    borderWidth: 1,
                    borderColor: colors.surface.cardBorder,
                    gap: s(12),
                  }}>
                  <Image
                    source={{ uri: media.uri }}
                    resizeMode="cover"
                    className="rounded-[18px]"
                    style={{
                      width: s(84),
                      height: s(84),
                      backgroundColor: colors.surface.muted,
                    }}
                  />
                  <View className="flex-1">
                    <Text
                      className="font-extrabold"
                      style={{ fontSize: s(12), color: colors.text.primary }}>
                      {media.description || "Untitled media"}
                    </Text>
                    <Text
                      className="mt-2 font-semibold"
                      style={{ fontSize: s(11), color: colors.map.missing }}>
                      No GPS. Add it to the selected highlight or leave it
                      off-map.
                    </Text>
                    <View className="mt-3 flex-row" style={{ gap: s(8) }}>
                      <ActionButton
                        title="Add here"
                        tone="ghost"
                        onPress={() => moveMissingMediaToNode(media)}
                        scale={scale}
                      />
                      <ActionButton
                        title="Skip"
                        tone="soft"
                        onPress={() => skipMissingMedia(media.id)}
                        scale={scale}
                      />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </EditSheet>
      </ScrollView>
    </View>
  );
}

function moveListItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  nextItems.splice(toIndex, 0, movedItem!);

  return nextItems;
}

function rebuildRouteSegments(
  nodes: TripNode[],
  previousSegments: RouteSegment[],
) {
  const transportByPair = new Map(
    previousSegments.map((segment) => [
      `${segment.fromNodeId}:${segment.toNodeId}`,
      segment.transport,
    ]),
  );

  return nodes.slice(1).map((node, index) => {
    const previousNode = nodes[index]!;
    const key = `${previousNode.id}:${node.id}`;
    const reverseKey = `${node.id}:${previousNode.id}`;

    return {
      id: `segment-${previousNode.id}-${node.id}`,
      fromNodeId: previousNode.id,
      toNodeId: node.id,
      transport:
        transportByPair.get(key) ?? transportByPair.get(reverseKey) ?? "none",
    };
  });
}
