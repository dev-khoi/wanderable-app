import { Pressable, Text, View } from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";

const { colors } = wanderableTheme;

type AddTripCardProps = {
  active: boolean;
  cardWidth: number;
  isFirst: boolean;
  onPress: () => void;
  scale: number;
  spacing: number;
};

export function AddTripCard({
  active,
  cardWidth,
  isFirst,
  onPress,
  scale,
  spacing,
}: AddTripCardProps) {
  const s = (value: number) => value * scale;
  const cardHeight = s(360);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: isFirst ? 0 : spacing,
        borderRadius: s(30),
        backgroundColor: active ? "#ECE8EE" : "#E7E3E9",
        borderWidth: 1,
        borderColor: "#D7D1DA",
        padding: s(14),
        shadowColor: colors.shadow.default,
        shadowOpacity: active ? 0.08 : 0.05,
        shadowOffset: { width: 0, height: s(6) },
        shadowRadius: s(12),
        elevation: active ? 5 : 3,
      }}>
      <View
        className="flex-1 items-center justify-center"
        style={{
          borderRadius: s(24),
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#C9C2CC",
          backgroundColor: "rgba(255,255,255,0.42)",
        }}>
        <View
          className="items-center justify-center"
          style={{
            width: s(56),
            height: s(56),
            borderRadius: s(999),
            backgroundColor: colors.background.surface,
          }}>
          <Text
            className="font-extrabold"
            style={{ fontSize: s(28), color: colors.text.primary }}>
            +
          </Text>
        </View>
        <Text
          className="font-extrabold"
          style={{ marginTop: s(16), fontSize: s(24), color: colors.text.primary }}>
          Add trip
        </Text>
        <Text
          className="font-semibold"
          style={{
            marginTop: s(8),
            paddingHorizontal: s(28),
            fontSize: s(13),
            lineHeight: s(19),
            textAlign: "center",
            color: colors.text.muted,
          }}>
          Import photos and build another trip card.
        </Text>
      </View>
    </Pressable>
  );
}
