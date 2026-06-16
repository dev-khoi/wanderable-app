import { Text, View } from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";

const { colors } = wanderableTheme;

type TripCardEmptyStateProps = {
  isLoading: boolean;
  scale: number;
};

export function TripCardEmptyState({ isLoading, scale }: TripCardEmptyStateProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      style={{
        borderRadius: s(24),
        padding: s(20),
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.surface.cardBorder,
      }}>
      <Text
        className="font-extrabold"
        style={{ fontSize: s(20), color: colors.text.primary }}>
        {isLoading ? "Loading globe" : "Start your first trip"}
      </Text>
      <Text
        className="font-semibold"
        style={{
          marginTop: s(8),
          fontSize: s(13),
          lineHeight: s(19),
          color: colors.text.muted,
        }}>
        {isLoading
          ? "Pulling your trips from Supabase."
          : "No trips yet. Use Add trip when you're ready to import one."}
      </Text>
    </View>
  );
}
