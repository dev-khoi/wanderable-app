import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AvatarPlaceholder } from '@/components/wanderable';
import { TripMap } from '@/components/wanderable/TripMap';
import { wanderableTheme } from '@/constants/wanderableTheme';
import { type TripNode, useMockTrip } from '@/lib/mockData';

const TRIP_CARD_ROUTE = '/trip-card' as Href;
const TRIP_EDIT_ROUTE = '/trip-edit' as Href;
const { colors } = wanderableTheme;

export default function TripViewScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const trip = useMockTrip();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const [selectedDayId, setSelectedDayId] = useState<'all' | string>('all');
  const [activeNodeId, setActiveNodeId] = useState(trip.nodes[2]?.id ?? trip.nodes[0].id);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const activeNode = trip.nodes.find((node) => node.id === activeNodeId) ?? trip.nodes[0];
  const activeIndex = Math.max(0, trip.nodes.findIndex((node) => node.id === activeNode.id));
  const activeMedia = activeNode.media[0];

  const goToNode = (nodeId: string) => {
    const nextNode = trip.nodes.find((node) => node.id === nodeId);

    setActiveNodeId(nodeId);
    if (nextNode) {
      setSelectedDayId(nextNode.dayId);
    }
    setIsStoryOpen(false);
  };

  const goToDay = (dayId: string) => {
    const firstNodeForDay = trip.nodes.find((node) => node.dayId === dayId);

    if (!firstNodeForDay) {
      return;
    }

    setSelectedDayId(dayId);
    setActiveNodeId(firstNodeForDay.id);
    setIsStoryOpen(false);
  };

  const goToPreviousNode = () => {
    const previous = trip.nodes[Math.max(0, activeIndex - 1)];
    goToNode(previous.id);
  };

  const goToNextNode = () => {
    const next = trip.nodes[Math.min(trip.nodes.length - 1, activeIndex + 1)];
    goToNode(next.id);
  };

  return (
    <View className="flex-1 " style={{ backgroundColor: colors.background.surface }}>
      <View
        className="absolute flex-row items-center justify-between"
        style={{ top: insets.top, left: canvasLeft, width: s(375), height: s(44), paddingHorizontal: s(12), zIndex: 10 }}>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.replace(TRIP_CARD_ROUTE)}>
          <Text className="font-extrabold" style={{ fontSize: s(18), color: colors.text.primary }}>{'<'}</Text>
        </Pressable>
        <View className="flex-row items-center">
          <AvatarPlaceholder scale={scale} style={{ width: s(44), height: s(44), marginRight: s(8) }} />
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.primary }}>{trip.ownerName}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push(TRIP_EDIT_ROUTE)}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.brand.secondary }}>Edit</Text>
        </Pressable>
      </View>

      {/* trip map */}
      <View style={{ position: 'absolute', top: insets.top + s(44), left: canvasLeft + s(2), width: s(371), height: height - insets.top - s(44), overflow: 'hidden', backgroundColor: colors.map.ocean }}>
        <TripMap
          activeNodeId={activeNode.id}
          allNodes={trip.nodes}
          nodes={trip.nodes}
          routeSegments={trip.routeSegments}
          scale={scale}
          selectedZoomLabel={trip.zoomStops[zoomIndex] ?? 'City'}
          onSelectNode={goToNode}
        />
      </View>

      <View
        className="absolute"
        style={{ top: insets.top + s(58), left: canvasLeft + s(18), right: canvasLeft + s(18), zIndex: 5 }}>
        <View className="flex-row" style={{ gap: s(8) }}>
          {trip.zoomStops.map((stop, index) => {
            const isActive = index === zoomIndex;

            return (
              <Pressable
                key={stop}
                accessibilityRole="button"
                className="items-center justify-center"
                style={{
                  paddingHorizontal: s(12),
                  height: s(30),
                  borderRadius: s(999),
                  backgroundColor: isActive ? colors.surface.darkGlass : colors.surface.glass,
                }}
                onPress={() => setZoomIndex(index)}>
                <Text className="font-extrabold" style={{ fontSize: s(11), color: isActive ? colors.text.inverse : colors.text.primary }}>{stop}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        className="absolute"
        style={{ left: canvasLeft + s(23), bottom: s(18), width: s(329), zIndex: 8 }}>
        <View className="flex-row" style={{ marginBottom: s(10), gap: s(8) }}>
          <DayChip active={selectedDayId === 'all'} label="All" scale={scale} onPress={() => setSelectedDayId('all')} />
          {trip.days.map((day) => (
            <DayChip key={day.id} active={selectedDayId === day.id} label={day.label.replace('Day ', 'D')} scale={scale} onPress={() => goToDay(day.id)} />
          ))}
        </View>

        <View className="flex-row items-center" style={{ marginBottom: s(10), gap: s(6) }}>
          {trip.nodes.map((node, index) => {
            const isActive = node.id === activeNode.id;

            return (
              <Pressable
                key={node.id}
                accessibilityRole="button"
                className="flex-1 items-center justify-center"
                style={{ height: s(24) }}
                onPress={() => goToNode(node.id)}>
                <View
                  style={{
                    width: isActive ? s(28) : s(10),
                    height: s(6),
                    borderRadius: s(999),
                    backgroundColor: isActive ? colors.brand.secondary : colors.surface.glass,
                  }}
                />
                {index < trip.nodes.length - 1 ? <View style={{ position: 'absolute', left: '56%', right: '-44%', height: s(2), backgroundColor: colors.surface.glass }} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            borderRadius: s(18),
            padding: s(16),
            backgroundColor: colors.surface.glass,
            shadowColor: colors.shadow.default,
            shadowOpacity: 0.18,
            shadowOffset: { width: 0, height: s(12) },
            shadowRadius: s(24),
            elevation: 10,
          }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: s(10) }}>
            <View>
              <Text className="font-extrabold" style={{ fontSize: s(13), color: colors.text.primary }}>{activeNode.dayId.replace('day-', 'day ')}:</Text>
              <Text className="font-extrabold" style={{ marginTop: s(4), fontSize: s(16), color: colors.text.strong }}>{activeNode.title}</Text>
              <Text className="font-semibold" style={{ marginTop: s(2), fontSize: s(11), color: colors.text.muted }}>{activeNode.locationName} - {activeNode.timeRange}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setIsStoryOpen(true)}>
              <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.brand.secondary }}>Open</Text>
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setIsStoryOpen(true)}>
            <Image source={{ uri: activeMedia.uri }} resizeMode="cover" style={{ width: '100%', height: s(126), borderRadius: s(14), backgroundColor: colors.brand.secondary }} />
          </Pressable>
          <Text numberOfLines={2} className="font-semibold" style={{ marginTop: s(10), fontSize: s(12), lineHeight: s(17), color: colors.text.primary }}>{activeNode.blog}</Text>
          <View className="flex-row items-center justify-between" style={{ marginTop: s(12) }}>
            <Pressable accessibilityRole="button" onPress={goToPreviousNode}>
              <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.text.muted }}>Previous</Text>
            </Pressable>
            <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.text.primary }}>{activeIndex + 1}/{trip.nodes.length}</Text>
            <Pressable accessibilityRole="button" onPress={goToNextNode}>
              <Text className="font-extrabold" style={{ fontSize: s(12), color: colors.brand.secondary }}>Next</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {isStoryOpen ? (
        <View className="absolute" style={{ top: insets.top + s(78), left: canvasLeft + s(23), width: s(329), bottom: s(19), zIndex: 20 }}>
          <ImmersiveStoryCard node={activeNode} scale={scale} onClose={() => setIsStoryOpen(false)} onPrevious={goToPreviousNode} onNext={goToNextNode} />
        </View>
      ) : null}
    </View>
  );
}

type DayChipProps = {
  active: boolean;
  label: string;
  scale: number;
  onPress: () => void;
};

function DayChip({ active, label, scale, onPress }: DayChipProps) {
  const s = (value: number) => value * scale;

  return (
    <Pressable
      accessibilityRole="button"
      className="items-center justify-center"
      style={{ minWidth: s(46), height: s(31), borderRadius: s(999), backgroundColor: active ? colors.brand.secondary : colors.surface.glass }}
      onPress={onPress}>
      <Text className="font-extrabold" style={{ fontSize: s(11), color: active ? colors.text.inverse : colors.text.primary }}>{label}</Text>
    </Pressable>
  );
}

type ImmersiveStoryCardProps = {
  node: TripNode;
  scale: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function ImmersiveStoryCard({ node, scale, onClose, onPrevious, onNext }: ImmersiveStoryCardProps) {
  const s = (value: number) => value * scale;
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const media = node.media[Math.min(activeMediaIndex, node.media.length - 1)] ?? node.media[0];

  const previousMedia = () => {
    if (activeMediaIndex === 0) {
      onPrevious();
      setActiveMediaIndex(0);
      return;
    }

    setActiveMediaIndex(activeMediaIndex - 1);
  };

  const nextMedia = () => {
    if (activeMediaIndex >= node.media.length - 1) {
      onNext();
      setActiveMediaIndex(0);
      return;
    }

    setActiveMediaIndex(activeMediaIndex + 1);
  };

  return (
    <View className="flex-1" style={{ borderRadius: s(4), padding: s(20), backgroundColor: colors.surface.muted }}>
      <View className="flex-row items-start justify-between" style={{ marginBottom: s(14) }}>
        <View>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.strong }}>{node.dayId.replace('day-', 'day ')}:</Text>
          <Text className="font-extrabold" style={{ marginTop: s(12), fontSize: s(14), color: colors.text.strong }}>{node.locationName}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.text.primary }}>X</Text>
        </Pressable>
      </View>
      <View style={{ flex: 1, borderRadius: s(2), overflow: 'hidden', backgroundColor: colors.brand.secondary }}>
        <Image source={{ uri: media.uri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        <View className="absolute flex-row" style={{ top: s(10), left: s(10), right: s(10), gap: s(5) }}>
          {node.media.map((item, index) => (
            <View key={item.id} style={{ flex: 1, height: s(3), borderRadius: s(999), backgroundColor: index <= activeMediaIndex ? colors.text.inverse : 'rgba(255,255,255,0.36)' }} />
          ))}
        </View>
        <Pressable accessibilityRole="button" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%' }} onPress={previousMedia} />
        <Pressable accessibilityRole="button" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '42%' }} onPress={nextMedia} />
        <View style={{ position: 'absolute', left: s(18), right: s(18), bottom: s(18) }}>
          <Text className="font-extrabold" style={{ fontSize: s(18), color: colors.text.inverse }}>{node.title}</Text>
          <Text className="font-bold" style={{ marginTop: s(8), fontSize: s(13), lineHeight: s(18), color: colors.text.inverse }}>{media.description || node.blog}</Text>
          {node.voiceNoteSeconds ? (
            <View className="flex-row items-center" style={{ marginTop: s(12), padding: s(9), borderRadius: s(999), backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Text className="font-extrabold" style={{ fontSize: s(11), color: colors.text.inverse }}>voice note - {node.voiceNoteSeconds}s</Text>
              <View style={{ flex: 1, height: s(2), marginLeft: s(10), borderRadius: s(999), backgroundColor: colors.text.inverse }} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
