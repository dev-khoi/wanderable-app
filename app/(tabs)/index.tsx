import { type Href, router } from "expo-router";
import {
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { PrimaryButton, WanderableWordmark } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

const MAP_IMAGE = require("@/assets/images/onboarding-map.png");
const AUTH_SIGN_IN_ROUTE = {
  pathname: "/auth",
  params: { mode: "signin" },
} as Href;
const AUTH_SIGN_UP_ROUTE = {
  pathname: "/auth",
  params: { mode: "signup" },
} as Href;
const { colors } = wanderableTheme;

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.darkMap }}>
      {/* the backgorund image */}
      <Image
        source={MAP_IMAGE}
        className="absolute inset-0"
        resizeMode="cover"
      />

      <View
        className="absolute inset-0"
        style={{ backgroundColor: colors.overlay.mapScrim }}
      />
      <WanderableWordmark
        scale={scale}
        textColor={colors.text.inverse}
        style={{
          position: "absolute",
          top: s(44),
          left: canvasLeft,
          width: s(375),
        }}
      />

      <View
        className="absolute bottom-0 items-center"
        style={{
          left: canvasLeft,
          width: s(375),
          paddingTop: s(18),
          paddingBottom: s(12),
          borderTopLeftRadius: s(30),
          borderTopRightRadius: s(30),
          backgroundColor: colors.background.surface,
        }}>
        {/* <PaginationDots
          scale={scale}
          style={{ marginBottom: s(17) }}
        /> */}
        {/* this wont be needed for now, as it distrct the user  */}
        {/* <Text
          className="text-center font-extrabold"
          style={{
            width: s(327),
            fontSize: s(30),
            lineHeight: s(39),
            color: colors.text.primary,
            marginBottom: s(40),
          }}>
          {"Recreate trip\nfrom your photos"}
        </Text> */}
        <Pressable onPress={() => router.push("/autoscan")}>
          <Text>devmode skp</Text>
        </Pressable>
        <PrimaryButton
          title="Get Started"
          scale={scale}
          style={{
            width: s(327),
            height: s(48),
            marginBottom: s(28),
          }}
          onPress={() => router.push(AUTH_SIGN_IN_ROUTE)}
        />
        <Pressable
          className="flex-row items-center"
          style={{ marginBottom: s(35) }}
          onPress={() => router.push(AUTH_SIGN_UP_ROUTE)}>
          <Text
            className="font-bold"
            style={{ fontSize: s(14), color: colors.text.subtle }}>
            Don't have an account?
          </Text>
          <Text
            className="font-extrabold"
            style={{
              marginLeft: s(6),
              fontSize: s(14),
              color: colors.text.accent,
            }}>
            Register
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
