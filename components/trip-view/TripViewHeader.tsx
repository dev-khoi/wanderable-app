import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { AvatarPlaceholder } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

const TRIP_CARD_ROUTE = "/trip-card";
const { colors } = wanderableTheme;

type TripViewHeaderProps = {
  canvasLeft: number;
  ownerName: string;
  rightLabel?: string;
  onRightPress?: () => void;
  scale: number;
  top: number;
};

export function TripViewHeader({
  canvasLeft,
  ownerName,
  rightLabel,
  onRightPress,
  scale,
  top,
}: TripViewHeaderProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className="absolute flex-row items-center justify-between"
      style={{
        top,
        left: canvasLeft,
        width: s(375),
        height: s(44),
        paddingHorizontal: s(12),
        zIndex: 10,
      }}>
      <Pressable
        accessibilityRole="button"
        hitSlop={12}
        onPress={() => router.replace(TRIP_CARD_ROUTE)}>
        <ChevronLeft color={colors.text.primary} size={s(22)} strokeWidth={2.5} />
      </Pressable>
      <View className="flex-row items-center">
        <AvatarPlaceholder
          scale={scale}
          style={{ width: s(44), height: s(44), marginRight: s(8) }}
        />
        <Text
          className="font-extrabold"
          style={{ fontSize: s(14), color: colors.text.primary }}>
          {ownerName}
        </Text>
      </View>
      {rightLabel && onRightPress ? (
        <Pressable accessibilityRole="button" onPress={onRightPress}>
          <Text
            className="font-extrabold"
            style={{ fontSize: s(14), color: colors.brand.secondary }}>
            {rightLabel}
          </Text>
        </Pressable>
      ) : (
        <View style={{ width: s(44) }} />
      )}
    </View>
  );
}
