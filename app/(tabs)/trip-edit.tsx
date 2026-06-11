import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { wanderableTheme } from '@/constants/wanderableTheme';
import { type MediaItem, type TransportMode, type TripNode, updateMockTrip, useMockTrip } from '@/lib/mockData';

const TRIP_VIEW_ROUTE = '/trip-view' as Href;
const { colors } = wanderableTheme;
const transportOrder: TransportMode[] = ['none', 'walk', 'bike', 'car', 'fly'];

export default function TripEditScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const trip = useMockTrip();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const [activeNodeId, setActiveNodeId] = useState(trip.nodes[2]?.id ?? trip.nodes[0].id);
  const activeNode = trip.nodes.find((node) => node.id === activeNodeId) ?? trip.nodes[0];
  const activeDay = trip.days.find((day) => day.id === activeNode.dayId) ?? trip.days[0];
  const activeSegment = trip.routeSegments.find((segment) => segment.fromNodeId === activeNode.id || segment.toNodeId === activeNode.id);

  const updateActiveNode = (changes: Partial<TripNode>) => {
    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      nodes: currentTrip.nodes.map((node) => (node.id === activeNode.id ? { ...node, ...changes } : node)),
    }));
  };

  const updateMediaDescription = (mediaId: string, description: string) => {
    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      nodes: currentTrip.nodes.map((node) => {
        if (node.id !== activeNode.id) {
          return node;
        }

        return {
          ...node,
          media: node.media.map((media) => (media.id === mediaId ? { ...media, description } : media)),
        };
      }),
    }));
  };

  const mergeWithPrevious = () => {
    const activeIndex = trip.nodes.findIndex((node) => node.id === activeNode.id);

    if (activeIndex <= 0) {
      return;
    }

    const previousNode = trip.nodes[activeIndex - 1];
    const mergedNode: TripNode = {
      ...activeNode,
      id: `${previousNode.id}-${activeNode.id}-merged`,
      title: `${previousNode.title} + ${activeNode.title}`,
      timeRange: `${previousNode.timeRange.split(' - ')[0]} - ${activeNode.timeRange.split(' - ')[1] ?? activeNode.timeRange}`,
      photoCount: previousNode.photoCount + activeNode.photoCount,
      blog: `${previousNode.blog}\n\n${activeNode.blog}`,
      voiceNoteSeconds: activeNode.voiceNoteSeconds ?? previousNode.voiceNoteSeconds,
      media: [...previousNode.media, ...activeNode.media].sort((a, b) => a.takenAt.localeCompare(b.takenAt)),
    };

    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      nodes: currentTrip.nodes.flatMap((node) => {
        if (node.id === previousNode.id) {
          return [mergedNode];
        }

        if (node.id === activeNode.id) {
          return [];
        }

        return [node];
      }),
      routeSegments: currentTrip.routeSegments
        .filter((segment) => !(segment.fromNodeId === previousNode.id && segment.toNodeId === activeNode.id))
        .map((segment) => ({
          ...segment,
          fromNodeId: segment.fromNodeId === activeNode.id || segment.fromNodeId === previousNode.id ? mergedNode.id : segment.fromNodeId,
          toNodeId: segment.toNodeId === activeNode.id || segment.toNodeId === previousNode.id ? mergedNode.id : segment.toNodeId,
        }))
        .filter((segment) => segment.fromNodeId !== segment.toNodeId),
    }));
    setActiveNodeId(mergedNode.id);
  };

  const splitLastMedia = () => {
    if (activeNode.media.length < 2) {
      return;
    }

    const mediaToSplit = activeNode.media[activeNode.media.length - 1];
    const remainingMedia = activeNode.media.slice(0, -1);
    const newNode: TripNode = {
      ...activeNode,
      id: `${activeNode.id}-split-${mediaToSplit.id}`,
      title: `${activeNode.title} detail`,
      photoCount: 1,
      blog: 'Split from the original node. Confirm the exact location before publishing.',
      media: [mediaToSplit],
      coordinate: [activeNode.coordinate[0] + 0.016, activeNode.coordinate[1] + 0.01],
      mapPoint: {
        x: Math.min(92, activeNode.mapPoint.x + 8),
        y: Math.min(88, activeNode.mapPoint.y + 5),
      },
    };

    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      nodes: currentTrip.nodes.flatMap((node) => {
        if (node.id !== activeNode.id) {
          return [node];
        }

        return [{ ...node, media: remainingMedia, photoCount: remainingMedia.length }, newNode];
      }),
      routeSegments: [
        ...currentTrip.routeSegments,
        {
          id: `segment-${activeNode.id}-${newNode.id}`,
          fromNodeId: activeNode.id,
          toNodeId: newNode.id,
          transport: 'walk',
        },
      ],
    }));
    setActiveNodeId(newNode.id);
  };

  const moveMissingMediaToNode = (media: MediaItem) => {
    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      missingGpsMedia: currentTrip.missingGpsMedia.filter((item) => item.id !== media.id),
      nodes: currentTrip.nodes.map((node) => {
        if (node.id !== activeNode.id) {
          return node;
        }

        const mediaWithGps = { ...media, hasGps: true };
        const nextMedia = [...node.media, mediaWithGps].sort((a, b) => a.takenAt.localeCompare(b.takenAt));

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
      missingGpsMedia: currentTrip.missingGpsMedia.filter((media) => media.id !== mediaId),
    }));
  };

  const cycleTransport = () => {
    if (!activeSegment) {
      return;
    }

    const currentIndex = transportOrder.indexOf(activeSegment.transport);
    const nextTransport = transportOrder[(currentIndex + 1) % transportOrder.length];

    updateMockTrip((currentTrip) => ({
      ...currentTrip,
      routeSegments: currentTrip.routeSegments.map((segment) => (segment.id === activeSegment.id ? { ...segment, transport: nextTransport } : segment)),
    }));
  };

  const reorderDays = () => {
    updateMockTrip((currentTrip) => {
      const [firstDay, ...restDays] = currentTrip.days;

      return {
        ...currentTrip,
        days: [...restDays, firstDay],
      };
    });
  };

  const setTripCover = () => {
    const coverUri = activeNode.media[0]?.uri ?? trip.coverUri;
    updateMockTrip((currentTrip) => ({ ...currentTrip, coverUri }));
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background.surface }}>
      <View
        className="absolute left-0 right-0 z-10 flex-row items-center justify-between bg-white px-5"
        style={{ top: 0, paddingTop: insets.top, height: insets.top + s(62), borderBottomWidth: 1, borderBottomColor: colors.surface.cardBorder }}>
        <Pressable accessibilityRole="button" onPress={() => router.replace(TRIP_VIEW_ROUTE)}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.primary }}>Cancel</Text>
        </Pressable>
        <Text className="font-extrabold" style={{ fontSize: s(16), color: colors.text.strong }}>Edit Trip</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace(TRIP_VIEW_ROUTE)}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.brand.secondary }}>Done</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: insets.top + s(82), paddingBottom: s(32), paddingHorizontal: s(18), minHeight: height }}>
        <View className="rounded-3xl p-4" style={{ backgroundColor: colors.surface.soft }}>
          <Image source={{ uri: trip.coverUri }} resizeMode="cover" className="w-full rounded-2xl" style={{ height: s(152), backgroundColor: colors.surface.muted }} />
          <Text className="mt-4 font-extrabold" style={{ fontSize: s(24), color: colors.text.strong }}>{trip.title}</Text>
          <Text className="mt-1 font-semibold" style={{ fontSize: s(13), color: colors.text.muted }}>{trip.dateRange} - {trip.durationLabel} - {trip.distanceLabel}</Text>
          <View className="mt-4 flex-row" style={{ gap: s(8) }}>
            <EditPill label="Set cover" scale={scale} onPress={setTripCover} />
            <EditPill label="Reorder days" scale={scale} onPress={reorderDays} />
          </View>
        </View>

        <Text className="mt-6 font-extrabold" style={{ fontSize: s(18), color: colors.text.strong }}>Timeline nodes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row" style={{ gap: s(10) }}>
            {trip.nodes.map((node) => {
              const isActive = node.id === activeNode.id;

              return (
                <Pressable
                  key={node.id}
                  accessibilityRole="button"
                  className="rounded-2xl p-3"
                  style={{ width: s(150), backgroundColor: isActive ? colors.text.primary : colors.surface.soft }}
                  onPress={() => setActiveNodeId(node.id)}>
                  <Image source={{ uri: node.media[0]?.uri }} resizeMode="cover" className="rounded-xl" style={{ width: '100%', height: s(86), backgroundColor: colors.surface.muted }} />
                  <Text numberOfLines={2} className="mt-3 font-extrabold" style={{ fontSize: s(12), color: isActive ? colors.text.inverse : colors.text.strong }}>{node.title}</Text>
                  <Text className="mt-1 font-semibold" style={{ fontSize: s(10), color: isActive ? colors.text.inverse : colors.text.muted }}>{node.photoCount} media</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="mt-5 rounded-3xl bg-white p-4" style={{ borderWidth: 1, borderColor: colors.surface.cardBorder }}>
          <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.brand.secondary }}>{activeDay.label} - {activeDay.dominantLocation}</Text>
          <Text className="mt-3 font-extrabold" style={{ fontSize: s(14), color: colors.text.strong }}>Node name</Text>
          <TextInput
            className="mt-2 rounded-2xl px-4 py-3 font-bold"
            style={{ minHeight: s(48), backgroundColor: colors.surface.soft, color: colors.text.primary, fontSize: s(14) }}
            value={activeNode.title}
            onChangeText={(title) => updateActiveNode({ title })}
          />

          <Text className="mt-4 font-extrabold" style={{ fontSize: s(14), color: colors.text.strong }}>Location</Text>
          <TextInput
            className="mt-2 rounded-2xl px-4 py-3 font-bold"
            style={{ minHeight: s(48), backgroundColor: colors.surface.soft, color: colors.text.primary, fontSize: s(14) }}
            value={activeNode.locationName}
            onChangeText={(locationName) => updateActiveNode({ locationName })}
          />

          <Text className="mt-4 font-extrabold" style={{ fontSize: s(14), color: colors.text.strong }}>Blog memory</Text>
          <TextInput
            multiline
            className="mt-2 rounded-2xl px-4 py-3 font-semibold"
            style={{ minHeight: s(132), backgroundColor: colors.surface.soft, color: colors.text.primary, fontSize: s(13), textAlignVertical: 'top' }}
            value={activeNode.blog}
            onChangeText={(blog) => updateActiveNode({ blog })}
          />

          <View className="mt-4 flex-row flex-wrap" style={{ gap: s(8) }}>
            <EditPill label="Merge previous" scale={scale} onPress={mergeWithPrevious} />
            <EditPill label="Split last media" scale={scale} onPress={splitLastMedia} />
            <EditPill label={`Transport: ${activeSegment?.transport ?? 'none'}`} scale={scale} onPress={cycleTransport} />
            <EditPill label="Voice note 30s" scale={scale} onPress={() => updateActiveNode({ voiceNoteSeconds: 30 })} />
          </View>
        </View>

        <Text className="mt-6 font-extrabold" style={{ fontSize: s(18), color: colors.text.strong }}>Media in this node</Text>
        <View className="mt-3" style={{ gap: s(12) }}>
          {activeNode.media.map((media) => (
            <View key={media.id} className="rounded-3xl bg-white p-3" style={{ borderWidth: 1, borderColor: colors.surface.cardBorder }}>
              <Image source={{ uri: media.uri }} resizeMode="cover" className="w-full rounded-2xl" style={{ height: s(148), backgroundColor: colors.surface.muted }} />
              <Text className="mt-3 font-extrabold" style={{ fontSize: s(12), color: colors.text.strong }}>{media.type.toUpperCase()} - {new Date(media.takenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
              <TextInput
                className="mt-2 rounded-2xl px-4 py-3 font-semibold"
                style={{ minHeight: s(56), backgroundColor: colors.surface.soft, color: colors.text.primary, fontSize: s(12), textAlignVertical: 'top' }}
                value={media.description}
                onChangeText={(description) => updateMediaDescription(media.id, description)}
              />
            </View>
          ))}
        </View>

        <Text className="mt-6 font-extrabold" style={{ fontSize: s(18), color: colors.text.strong }}>Missing GPS inbox</Text>
        <View className="mt-3" style={{ gap: s(12) }}>
          {trip.missingGpsMedia.length === 0 ? (
            <View className="rounded-3xl p-4" style={{ backgroundColor: colors.surface.soft }}>
              <Text className="font-bold" style={{ fontSize: s(13), color: colors.text.muted }}>No unplaced media left. Ignored media will stay out of the public trip.</Text>
            </View>
          ) : trip.missingGpsMedia.map((media) => (
            <View key={media.id} className="flex-row rounded-3xl bg-white p-3" style={{ borderWidth: 1, borderColor: colors.surface.cardBorder, gap: s(12) }}>
              <Image source={{ uri: media.uri }} resizeMode="cover" className="rounded-2xl" style={{ width: s(88), height: s(88), backgroundColor: colors.surface.muted }} />
              <View className="flex-1">
                <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.text.strong }}>{media.description}</Text>
                <Text className="mt-1 font-semibold" style={{ fontSize: s(11), color: colors.map.missing }}>No GPS location</Text>
                <View className="mt-3 flex-row" style={{ gap: s(8) }}>
                  <SmallAction label="Add here" scale={scale} onPress={() => moveMissingMediaToNode(media)} />
                  <SmallAction label="Skip" scale={scale} muted onPress={() => skipMissingMedia(media.id)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

type EditPillProps = {
  label: string;
  scale: number;
  onPress: () => void;
};

function EditPill({ label, scale, onPress }: EditPillProps) {
  const s = (value: number) => value * scale;

  return (
    <Pressable accessibilityRole="button" className="items-center justify-center rounded-full" style={{ minHeight: s(34), paddingHorizontal: s(13), backgroundColor: colors.brand.secondary }} onPress={onPress}>
      <Text className="font-extrabold" style={{ fontSize: s(11), color: colors.text.inverse }}>{label}</Text>
    </Pressable>
  );
}

type SmallActionProps = EditPillProps & {
  muted?: boolean;
};

function SmallAction({ label, scale, muted, onPress }: SmallActionProps) {
  const s = (value: number) => value * scale;

  return (
    <Pressable accessibilityRole="button" className="items-center justify-center rounded-full" style={{ minHeight: s(30), paddingHorizontal: s(11), backgroundColor: muted ? colors.surface.soft : colors.text.primary }} onPress={onPress}>
      <Text className="font-extrabold" style={{ fontSize: s(10), color: muted ? colors.text.primary : colors.text.inverse }}>{label}</Text>
    </Pressable>
  );
}
