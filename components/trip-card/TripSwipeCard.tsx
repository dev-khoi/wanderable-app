import { Image, Pressable, Text, View } from "react-native";
import { Trash2 } from "lucide-react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";
import type { TripSummaryViewModel } from "@/lib/trips/types";

const { colors } = wanderableTheme;

type TripSwipeCardProps = {
  active: boolean;
  cardWidth: number;
  isFirst: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
  onPress: () => void;
  scale: number;
  spacing: number;
  trip: TripSummaryViewModel;
};

export function TripSwipeCard({
  active,
  cardWidth,
  isFirst,
  isDeleting = false,
  onDelete,
  onPress,
  scale,
  spacing,
  trip,
}: TripSwipeCardProps) {
  const s = (value: number) => value * scale;
  const cardHeight = s(360);

  return (
    <View
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: isFirst ? 0 : spacing,
        justifyContent: "flex-end",
      }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: s(10),
          right: s(10),
          bottom: s(10),
          top: s(18),
          borderRadius: s(30),
          // backgroundColor: active ? "#D8D5DB" : "#D3D0D8",
        }}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{
          width: cardWidth,
          height: cardHeight - s(14),
          borderRadius: s(30),
          overflow: "hidden",
          transform: [{ scale: active ? 1 : 0.97 }],
          opacity: active ? 1 : 0.9,
          // backgroundColor: colors.background.deepSpace,
          // shadowColor: colors.shadow.default,
          // shadowOpacity: active ? 0.12 : 0.08,
          // shadowOffset: { width: 0, height: s(8) },
          // shadowRadius: s(18),
          elevation: active ? 8 : 4,
        }}>
        <View
          className="absolute"
          style={{
            left: s(14),
            right: s(14),
            top: s(14),
            bottom: s(14),
            borderRadius: s(24),
            backgroundColor: "#F3F0F4",
            padding: s(10),
          }}>
          <View
            style={{
              flex: 1,
              borderRadius: s(18),
              overflow: "hidden",
              backgroundColor: colors.background.deepSpace,
              shadowColor: colors.shadow.default,
              shadowOpacity: active ? 0.08 : 0.05,
              shadowOffset: { width: 0, height: s(6) },
              shadowRadius: s(12),
              elevation: active ? 5 : 3,
              }}>
            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={10}
                style={{
                  position: "absolute",
                  top: s(14),
                  right: s(14),
                  zIndex: 3,
                  width: s(38),
                  height: s(38),
                  borderRadius: s(999),
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(185, 28, 28, 0.88)",
                  opacity: isDeleting ? 0.6 : 1,
                }}
                disabled={isDeleting}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onDelete();
                }}>
                <Trash2 color={colors.text.inverse} size={s(16)} strokeWidth={2.4} />
              </Pressable>
            ) : null}
            {trip.coverUri ? (
              <Image
                source={{ uri: trip.coverUri }}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: colors.map.ocean,
                }}
              />
            )}

            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(7, 7, 17, 0.10)",
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "50%",
                backgroundColor: "rgba(7, 7, 17, 0.10)",
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "30%",
                backgroundColor: "rgba(7, 7, 17, 0.16)",
              }}
            />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "18%",
                backgroundColor: "rgba(7, 7, 17, 0.22)",
              }}
            />
          </View>

          <Text
            className="font-extrabold"
            style={{
              position: "absolute",
              left: s(28),
              right: s(28),
              bottom: s(70),
              fontSize: s(26),
              color: colors.text.inverse,
            }}>
            {trip.title}
          </Text>
          <Text
            className="font-semibold"
            numberOfLines={2}
            style={{
              position: "absolute",
              left: s(28),
              right: s(28),
              bottom: s(44),
              fontSize: s(13),
              lineHeight: s(18),
              color: "rgba(255,255,255,0.86)",
            }}>
            {trip.locationLabel}
          </Text>

          <View
            className="absolute flex-row flex-wrap"
            style={{ left: s(28), right: s(28), bottom: s(18), gap: s(8) }}>
            {[trip.dateRange, trip.durationLabel, trip.distanceLabel].map(
              (label) => (
                <View
                  key={label}
                  style={{
                    borderRadius: s(999),
                    paddingHorizontal: s(11),
                    paddingVertical: s(7),
                    backgroundColor: "rgba(255,255,255,0.14)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.14)",
                  }}>
                  <Text
                    className="font-extrabold"
                    style={{ fontSize: s(11), color: colors.text.inverse }}>
                    {label}
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}
