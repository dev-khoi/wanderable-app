import { Text, View } from "react-native";

import { SignOutButton } from "@/components/auth/SignOutButton";
import { AvatarPlaceholder } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

const { colors } = wanderableTheme;

type TripCardHeaderProps = {
  ownerName: string;
  scale: number;
};

export function TripCardHeader({ ownerName, scale }: TripCardHeaderProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: s(20), paddingBottom: s(8) }}>
      <View className="flex-row items-center">
        <AvatarPlaceholder scale={scale} style={{ marginRight: s(10) }} />
        <View>
          <Text
            className="font-extrabold"
            style={{ fontSize: s(16), color: colors.text.primary }}>
            {ownerName}
          </Text>
          <Text
            className="font-semibold"
            style={{
              marginTop: s(2),
              fontSize: s(12),
              color: colors.text.muted,
            }}>
            Your trips
          </Text>
        </View>
      </View>
      <SignOutButton />
    </View>
  );
}
