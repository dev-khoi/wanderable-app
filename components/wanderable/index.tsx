import { type ReactNode } from "react";
import {
  type GestureResponderEvent,
  Image,
  type ImageStyle,
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";

const { colors } = wanderableTheme;
const WANDERABLE_LOGO = require("../../assets/images/wanderable-icon.png");

type ScaledProps = {
  scale: number;
};

type WanderableMarkProps = {
  size: number;
  style?: StyleProp<ViewStyle>;
};

export function WanderableMark({ size, style }: WanderableMarkProps) {
  const pointSize = size * 0.35;

  return (
    <View
      className="items-center justify-center"
      style={[{ width: size, height: size }, style]}>
      <View
        className="items-center justify-center"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.brand.primary,
        }}>
        <View
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            backgroundColor: colors.background.surface,
          }}
        />
      </View>
      <View
        style={[
          {
            position: "absolute",
            width: 0,
            height: 0,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: colors.brand.primary,
          },
          {
            borderLeftWidth: pointSize / 2,
            borderRightWidth: pointSize / 2,
            borderTopWidth: pointSize,
            bottom: -pointSize * 0.36,
          },
        ]}
      />
    </View>
  );
}

type WanderableLogoProps = {
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
};

export function WanderableLogo({ width, height, style }: WanderableLogoProps) {
  return (
    <Image
      source={WANDERABLE_LOGO}
      resizeMode="contain"
      style={[{ width, height }, style]}
    />
  );
}

type WanderableWordmarkProps = {
  scale: number;
  textColor: string;
  style?: StyleProp<ViewStyle>;
};

export function WanderableWordmark({
  scale,
  textColor,
  style,
}: WanderableWordmarkProps) {
  return (
    <View className="flex-row items-center justify-center" style={style}>
      <WanderableLogo
        width={34 * scale}
        height={31.5 * scale}
        style={{ marginRight: 10 * scale }}
      />
      <Text
        className="font-extrabold"
        style={{
          fontSize: 23 * scale,
          letterSpacing: 0.2 * scale,
          color: textColor,
        }}>
        wanderable
      </Text>
    </View>
  );
}

type PaginationDotsProps = ScaledProps & {
  style?: StyleProp<ViewStyle>;
};

export function PaginationDots({ scale, style }: PaginationDotsProps) {
  const s = (value: number) => value * scale;

  return (
    <View className="flex-row items-center" style={[{ gap: s(8) }, style]}>
      <View
        style={{
          width: s(8),
          height: s(8),
          borderRadius: s(4),
          backgroundColor: colors.surface.muted,
        }}
      />
      <View
        style={{
          width: s(32),
          height: s(8),
          borderRadius: s(999),
          backgroundColor: colors.background.surface,
          shadowColor: colors.shadow.default,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 1,
        }}
      />
      <View
        style={{
          width: s(8),
          height: s(8),
          borderRadius: s(4),
          backgroundColor: colors.surface.muted,
        }}
      />
    </View>
  );
}

type PrimaryButtonProps = ScaledProps & {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  scale,
  style,
  textStyle,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="items-center justify-center"
      style={[
        { borderRadius: 16 * scale, backgroundColor: colors.brand.secondary },
        style,
      ]}
      onPress={onPress}>
      <Text
        className="font-extrabold"
        style={[
          { fontSize: 16 * scale, color: colors.text.inverse },
          textStyle,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

type NotificationBellProps = ScaledProps & {
  style?: StyleProp<ViewStyle>;
};

export function NotificationBell({ scale, style }: NotificationBellProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className="items-center justify-center"
      style={[
        {
          width: s(48),
          height: s(48),
          borderRadius: s(24),
          backgroundColor: colors.background.surface,
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.12,
          shadowOffset: { width: 0, height: s(8) },
          shadowRadius: s(18),
          elevation: 8,
        },
        style,
      ]}>
      <View
        style={{
          width: s(15),
          height: s(15),
          borderTopLeftRadius: s(8),
          borderTopRightRadius: s(8),
          borderWidth: s(2),
          borderBottomWidth: 0,
          borderColor: colors.icon.default,
        }}
      />
      <View
        style={{
          width: s(18),
          height: s(2),
          borderRadius: s(1),
          marginTop: -s(1),
          backgroundColor: colors.icon.default,
        }}
      />
      <View
        style={{
          width: s(4),
          height: s(4),
          borderRadius: s(2),
          marginTop: s(2),
          backgroundColor: colors.icon.default,
        }}
      />
      <View
        className="absolute"
        style={{
          width: s(8),
          height: s(8),
          borderRadius: s(4),
          top: s(13),
          right: s(13),
          backgroundColor: colors.icon.notification,
        }}
      />
    </View>
  );
}

type AvatarPlaceholderProps = ScaledProps & {
  style?: StyleProp<ViewStyle>;
};

export function AvatarPlaceholder({ scale, style }: AvatarPlaceholderProps) {
  const size = 48 * scale;

  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface.avatar,
        },
        style,
      ]}>
      <View
        className="mb-[3px]"
        style={{
          width: 13 * scale,
          height: 13 * scale,
          borderRadius: 6.5 * scale,
          backgroundColor: colors.surface.avatarFill,
        }}
      />
      <View
        style={{
          width: 25 * scale,
          height: 11 * scale,
          borderTopLeftRadius: 12 * scale,
          borderTopRightRadius: 12 * scale,
          backgroundColor: colors.surface.avatarFill,
        }}
      />
    </View>
  );
}

type TripSummaryCardProps = ScaledProps & {
  style?: StyleProp<ViewStyle>;
};

export function TripSummaryCard({ scale, style }: TripSummaryCardProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className=""
      style={[
        {
          width: s(317),
          height: s(358),
          borderRadius: s(14),
          backgroundColor: colors.background.surface,
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.16,
          shadowOffset: { width: 0, height: s(14) },
          shadowRadius: s(24),
          elevation: 10,
        },
        style,
      ]}>
      <View
        className="absolute"
        style={{
          top: s(12),
          left: s(12),
          width: s(292),
          height: s(334),
          borderRadius: s(12),
          backgroundColor: colors.surface.muted,
        }}
      />
      <Text
        className="absolute font-extrabold"
        style={{
          top: s(232),
          left: s(23),
          fontSize: s(24),
          lineHeight: s(29),
          color: colors.text.strong,
        }}>
        name of trip
      </Text>
      <View
        className="absolute flex-row items-center"
        style={{ top: s(241), right: s(22) }}>
        <WanderableMark size={s(12)} style={{ marginRight: s(4) }} />
        <Text
          className="font-semibold"
          style={{ fontSize: s(12), color: colors.text.muted }}>
          location
        </Text>
      </View>
      <View
        className="absolute flex-row items-center"
        style={{
          top: s(284),
          left: s(22),
          width: s(272),
          height: s(44),
          borderRadius: s(12),
          backgroundColor: colors.surface.soft,
        }}>
        <StatText scale={scale}>{"2026\nmarch"}</StatText>
        <StatText scale={scale}>{"3\ndays"}</StatText>
        <StatText scale={scale}>{"20\nkm"}</StatText>
      </View>
    </View>
  );
}

type StatTextProps = ScaledProps & {
  children: ReactNode;
};

function StatText({ children, scale }: StatTextProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text
        className="text-center font-semibold"
        style={{
          fontSize: 12 * scale,
          lineHeight: 15 * scale,
          color: colors.text.muted,
        }}>
        {children}
      </Text>
    </View>
  );
}
