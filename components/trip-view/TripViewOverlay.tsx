import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { wanderableTheme } from "@/constants/wanderableTheme";
import type { TripNode, TripViewModel } from "@/lib/trips/types";

const { colors } = wanderableTheme;
const HIGHLIGHT_CARD_WIDTH_RATIO = 0.78;

type TripViewOverlayProps = {
  activeIndex: number;
  activeMediaUri: string | null;
  canvasLeft: number;
  scale: number;
  top: number;
  trip: TripViewModel;
  viewportWidth: number;
  zoomIndex: number;
  onNodePress: (nodeId: string) => void;
  onNodeSnap: (index: number) => void;
  onOpenStory: () => void;
  onZoomPress: (index: number) => void;
};

export function TripViewOverlay({
  activeIndex,
  activeMediaUri,
  canvasLeft,
  scale,
  top,
  trip,
  viewportWidth,
  zoomIndex,
  onNodePress,
  onNodeSnap,
  onOpenStory,
  onZoomPress,
}: TripViewOverlayProps) {
  const s = (value: number) => value * scale;
  const carouselRef = useRef<ScrollView | null>(null);
  const cardWidth = useMemo(() => Math.min(s(329), viewportWidth * HIGHLIGHT_CARD_WIDTH_RATIO), [scale, viewportWidth]);
  const cardGap = s(14);
  const cardHeight = s(214);
  const pageWidth = cardWidth + cardGap;
  const sideInset = Math.max(canvasLeft + s(23), (viewportWidth - cardWidth) / 2);
  const [scrollProgress, setScrollProgress] = useState(activeIndex);

  const carouselProgress =
    trip.nodes.length <= 1
      ? 1
      : Math.max(0, Math.min(scrollProgress / (trip.nodes.length - 1), 1));

  useEffect(() => {
    carouselRef.current?.scrollTo({
      x: activeIndex * pageWidth,
      animated: true,
    });
  }, [activeIndex, pageWidth]);

  useEffect(() => {
    setScrollProgress(activeIndex);
  }, [activeIndex]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);

    if (nextIndex !== activeIndex) {
      onNodeSnap(nextIndex);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollProgress(event.nativeEvent.contentOffset.x / pageWidth);
  };

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(260)}
        className="absolute"
        style={{
          top,
          left: canvasLeft + s(18),
          right: canvasLeft + s(18),
          zIndex: 5,
        }}>
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
                  backgroundColor: isActive
                    ? colors.surface.darkGlass
                    : colors.surface.glass,
                }}
                onPress={() => onZoomPress(index)}>
                <Text
                  className="font-extrabold"
                  style={{
                    fontSize: s(11),
                    color: isActive ? colors.text.inverse : colors.text.primary,
                  }}>
                  {stop}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(320)}
        className="absolute"
        style={{
          left: 0,
          right: 0,
          bottom: s(18),
          zIndex: 8,
        }}>
        <View
          className="absolute"
          pointerEvents="none"
          style={{
            left: sideInset,
            right: sideInset,
            bottom: cardHeight + s(18),
          }}>
          <View
            style={{
              height: s(4),
              borderRadius: s(999),
              backgroundColor: colors.surface.glass,
              overflow: "hidden",
            }}>
            <View
              style={{
                width: `${carouselProgress * 100}%`,
                height: "100%",
                borderRadius: s(999),
                backgroundColor: colors.brand.secondary,
              }}
            />
          </View>
        </View>

        <ScrollView
          ref={carouselRef}
          horizontal
          decelerationRate="fast"
          disableIntervalMomentum
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={pageWidth}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingLeft: sideInset,
            paddingRight: sideInset - cardGap,
          }}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumScrollEnd}>
          {trip.nodes.map((node, index) => (
            <HighlightCard
              key={node.id}
              active={index === activeIndex}
              cardWidth={cardWidth}
              isFirst={index === 0}
              mediaUri={node.media[0]?.uri ?? null}
              node={node}
              scale={scale}
              spacing={cardGap}
              onOpen={onOpenStory}
              onSelect={() => onNodePress(node.id)}
            />
          ))}
        </ScrollView>

        {activeMediaUri ? null : (
          <View
            className="absolute self-center items-center"
            style={{ bottom: s(132) }}>
            <Text
              className="font-semibold"
              style={{ fontSize: s(12), color: colors.text.inverse }}>
              No cover media yet for this highlight.
            </Text>
          </View>
        )}
      </Animated.View>
    </>
  );
}

function HighlightCard({
  active,
  cardWidth,
  isFirst,
  mediaUri,
  node,
  scale,
  spacing,
  onOpen,
  onSelect,
}: {
  active: boolean;
  cardWidth: number;
  isFirst: boolean;
  mediaUri: string | null;
  node: TripNode;
  scale: number;
  spacing: number;
  onOpen: () => void;
  onSelect: () => void;
}) {
  const s = (value: number) => value * scale;
  const cardHeight = s(214);
  const storyPreview = "";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={active ? onOpen : onSelect}
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: isFirst ? 0 : spacing,
        borderRadius: s(24),
        overflow: "hidden",
        transform: [{ scale: active ? 1 : 0.96 }],
        opacity: active ? 1 : 0.84,
        backgroundColor: colors.surface.muted,
        shadowColor: colors.shadow.default,
        shadowOpacity: active ? 0.22 : 0.12,
        shadowOffset: { width: 0, height: s(16) },
        shadowRadius: s(30),
        elevation: active ? 14 : 6,
      }}>
      {mediaUri ? (
        <Image
          source={{ uri: mediaUri }}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: colors.background.deepSpace,
          }}
        />
      )}

      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(9, 13, 22, 0.28)",
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "68%",
          backgroundColor: "rgba(6, 9, 17, 0.08)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "52%",
          backgroundColor: "rgba(6, 9, 17, 0.14)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "36%",
          backgroundColor: "rgba(6, 9, 17, 0.22)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "24%",
          backgroundColor: "rgba(6, 9, 17, 0.34)",
        }}
      />

      <View
        className="absolute"
        style={{ left: s(18), right: s(18), bottom: s(18) }}>
        <Text
          className="font-extrabold"
          style={{ fontSize: s(20), color: colors.text.inverse }}>
          {node.title}
        </Text>
        <Text
          className="font-semibold"
          style={{
            marginTop: s(4),
            fontSize: s(12),
            color: colors.text.inverse,
          }}>
          {node.locationName} • {node.timeRange}
        </Text>

        {storyPreview ? (
          <Text
            numberOfLines={2}
            className="font-semibold"
            style={{
              marginTop: s(10),
              fontSize: s(12),
              lineHeight: s(18),
              color: colors.text.inverse,
            }}>
            {storyPreview}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
