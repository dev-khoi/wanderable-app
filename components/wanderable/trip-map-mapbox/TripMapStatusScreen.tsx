import { Text, View } from "react-native";

import { colors } from "./constants";

type TripMapStatusScreenProps = {
  body?: string;
  scale: number;
  title: string;
};

export function TripMapStatusScreen({
  body,
  scale,
  title,
}: TripMapStatusScreenProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background.deepSpace }}>
      <Text
        className="text-center font-extrabold"
        style={{ fontSize: 18 * scale, color: colors.text.inverse }}>
        {title}
      </Text>
      <Text
        className="mt-3 text-center font-semibold"
        style={{ fontSize: 12 * scale, color: colors.text.inverse }}>
        {body ?? ""}
      </Text>
    </View>
  );
}
