import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Pause, Play } from "lucide-react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { TransportModeIcon, transportIconMap } from "@/components/trip-edit/transportIcons";
import { wanderableTheme } from "@/constants/wanderableTheme";
import type { RouteSegment, TripNode } from "@/lib/trips/types";

const { colors } = wanderableTheme;
const STORY_ADVANCE_MS = 4200;
const LONG_PRESS_DELAY_MS = 180;

type ImmersiveStoryCardProps = {
  node: TripNode;
  routeSegment: RouteSegment | null;
  scale: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function ImmersiveStoryCard({
  node,
  routeSegment,
  scale,
  onClose,
  onPrevious,
  onNext,
}: ImmersiveStoryCardProps) {
  const s = (value: number) => value * scale;
  const topMediaControlHeight = s(320);
  const storyScrollTop = s(290);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isHoldPaused, setIsHoldPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressStartedAtRef = useRef<number | null>(null);
  const progressRef = useRef(0);
  const isPaused = isHoldPaused || isManuallyPaused;

  useEffect(() => {
    setActiveMediaIndex(0);
    setProgress(0);
    setIsHoldPaused(false);
    setIsManuallyPaused(false);
  }, [node.id]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const media =
    node.media[Math.min(activeMediaIndex, node.media.length - 1)] ??
    node.media[0] ??
    null;
  const storyBody = "";
  const transport =
    routeSegment?.transport && routeSegment.transport !== "none"
      ? transportIconMap[routeSegment.transport]
      : null;

  const progressValues = useMemo(
    () =>
      node.media.map((_, index) => {
        if (index < activeMediaIndex) {
          return 1;
        }

        if (index === activeMediaIndex) {
          return progress;
        }

        return 0;
      }),
    [activeMediaIndex, node.media, progress],
  );

  const previousMedia = () => {
    if (activeMediaIndex === 0) {
      onPrevious();
      return;
    }

    setActiveMediaIndex((index) => Math.max(0, index - 1));
    setProgress(0);
  };

  const nextMedia = () => {
    if (activeMediaIndex >= node.media.length - 1) {
      onNext();
      return;
    }

    setActiveMediaIndex((index) => Math.min(node.media.length - 1, index + 1));
    setProgress(0);
  };

  useEffect(() => {
    if (isPaused || !media) {
      return;
    }

    const startedAt = Date.now();
    const startedProgress = progressRef.current;
    const interval = setInterval(() => {
      const nextProgress = Math.min(
        1,
        startedProgress + (Date.now() - startedAt) / STORY_ADVANCE_MS,
      );
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        clearInterval(interval);
        nextMedia();
      }
    }, 60);

    return () => {
      clearInterval(interval);
    };
  }, [activeMediaIndex, isPaused, media]);

  const beginPress = () => {
    pressStartedAtRef.current = Date.now();
    setIsHoldPaused(true);
  };

  const endPress = (navigate: () => void) => {
    const pressDuration = pressStartedAtRef.current
      ? Date.now() - pressStartedAtRef.current
      : 0;

    pressStartedAtRef.current = null;
    setIsHoldPaused(false);

    if (pressDuration < LONG_PRESS_DELAY_MS) {
      navigate();
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="absolute inset-0"
      style={{ backgroundColor: "rgba(8, 10, 18, 0.42)" }}>
      <Animated.View
        entering={FadeInDown.duration(240)}
        className="flex-1 overflow-hidden"
        style={{
          borderRadius: s(30),
          backgroundColor: colors.surface.muted,
        }}>
        <View style={{ flex: 1, backgroundColor: colors.background.deepSpace }}>
          {media?.uri ? (
            <Image
              key={media.id}
              source={{ uri: media.uri }}
              resizeMode="cover"
              style={{ position: "absolute", width: "100%", height: "100%" }}
            />
          ) : null}

          <View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(10, 13, 24, 0.26)",
            }}
          />

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "78%",
              backgroundColor: "rgba(7, 10, 18, 0.06)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "58%",
              backgroundColor: "rgba(7, 10, 18, 0.14)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "42%",
              backgroundColor: "rgba(7, 10, 18, 0.24)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "28%",
              backgroundColor: "rgba(7, 10, 18, 0.4)",
            }}
          />

          <View
            className="absolute flex-row"
            style={{ top: s(14), left: s(14), right: s(14), gap: s(5) }}>
            {progressValues.map((value, index) => (
              <View
                key={`${node.id}-progress-${index}`}
                style={{
                  flex: 1,
                  height: s(3),
                  borderRadius: s(999),
                  backgroundColor: "rgba(255,255,255,0.24)",
                  overflow: "hidden",
                }}>
                <View
                  style={{
                    width: `${Math.max(0, Math.min(1, value)) * 100}%`,
                    height: "100%",
                    borderRadius: s(999),
                    backgroundColor: colors.text.inverse,
                  }}
                />
              </View>
            ))}
          </View>

          <View
            className="absolute flex-row items-start justify-between"
            style={{ top: s(30), left: s(18), right: s(18) }}>
            <View>
              <Text
                className="font-semibold"
                style={{ fontSize: s(12), color: colors.text.inverse }}>
                {node.locationName}
              </Text>
              <Text
                className="font-medium"
                style={{
                  marginTop: s(4),
                  fontSize: s(11),
                  color: colors.text.inverse,
                }}>
                {node.timeRange}
              </Text>
            </View>
            <View className="flex-row items-center" style={{ gap: s(8) }}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsManuallyPaused((current) => !current)}>
                <View
                  className="items-center justify-center"
                  style={{
                    width: s(34),
                    height: s(34),
                    borderRadius: s(17),
                    backgroundColor: "rgba(255,255,255,0.16)",
                  }}>
                  {isPaused ? (
                    <Play color={colors.text.inverse} size={s(14)} strokeWidth={2.4} />
                  ) : (
                    <Pause color={colors.text.inverse} size={s(14)} strokeWidth={2.4} />
                  )}
                </View>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={onClose}>
                <View
                  className="items-center justify-center"
                  style={{
                    width: s(34),
                    height: s(34),
                    borderRadius: s(17),
                    backgroundColor: "rgba(255,255,255,0.16)",
                  }}>
                  <Text
                    className="font-extrabold"
                    style={{ fontSize: s(13), color: colors.text.inverse }}>
                    X
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            style={{
              position: "absolute",
              left: 0,
              top: s(58),
              width: "42%",
              height: topMediaControlHeight,
            }}
            onPressIn={beginPress}
            onPressOut={() => endPress(previousMedia)}
          />
          <Pressable
            accessibilityRole="button"
            style={{
              position: "absolute",
              right: 0,
              top: s(58),
              width: "42%",
              height: topMediaControlHeight,
            }}
            onPressIn={beginPress}
            onPressOut={() => endPress(nextMedia)}
          />

          <ScrollView
            nestedScrollEnabled
            directionalLockEnabled
            alwaysBounceVertical
            bounces
            showsVerticalScrollIndicator={false}
            style={{
              position: "absolute",
              top: storyScrollTop,
              left: s(18),
              right: s(18),
              bottom: s(22),
            }}
            contentContainerStyle={{
              paddingTop: s(188),
              paddingBottom: s(18),
            }}>
            {transport ? (
              <View
                className="self-start flex-row items-center"
                style={{
                  gap: s(6),
                  borderRadius: s(999),
                  paddingHorizontal: s(10),
                  paddingVertical: s(6),
                  backgroundColor: "rgba(255,255,255,0.14)",
                }}>
                <TransportModeIcon mode={routeSegment!.transport} color={colors.text.inverse} size={s(14)} />
                <Text
                  className="font-extrabold"
                  style={{ fontSize: s(10), color: colors.text.inverse }}>
                  {transport.label}
                </Text>
              </View>
            ) : null}
            <Text
              className="font-extrabold"
              style={{
                marginTop: transport ? s(10) : 0,
                fontSize: s(24),
                color: colors.text.inverse,
              }}>
              {node.title}
            </Text>
            <Text
              className="font-semibold"
              style={{
                marginTop: s(6),
                fontSize: s(12),
                color: "rgba(255,255,255,0.82)",
              }}>
              {node.locationName} • {node.timeRange}
            </Text>
            {storyBody ? (
              <Text
                className="font-semibold"
                style={{
                  marginTop: s(10),
                  fontSize: s(13),
                  lineHeight: s(19),
                  color: colors.text.inverse,
                }}>
                {storyBody}
              </Text>
            ) : null}
          </ScrollView>

          <View
            pointerEvents="none"
            className="absolute"
            style={{ left: s(18), right: s(18), bottom: s(22) }}>
            <Text
              className="font-semibold"
              style={{ fontSize: s(10), color: "rgba(255,255,255,0.72)" }}>
              Swipe up to read
            </Text>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
