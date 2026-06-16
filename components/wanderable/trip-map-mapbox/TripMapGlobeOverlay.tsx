import { View } from "react-native";

import { colors } from "./constants";

type TripMapGlobeOverlayProps = {
  translateY?: number;
  scale: number;
};

export function TripMapGlobeOverlay({ scale, translateY = 0 }: TripMapGlobeOverlayProps) {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center"
      style={{ transform: [{ translateY }] }}>
      <View
        style={{
          position: "absolute",
          width: "92%",
          aspectRatio: 1,
          borderRadius: 999,
          backgroundColor: colors.map.globeGlowHalo,
          transform: [{ scale: 1.06 }],
        }}
      />
      <View
        style={{
          width: "86%",
          aspectRatio: 1,
          borderRadius: 999,
          backgroundColor: colors.map.globeGlow,
          borderWidth: Math.max(1, scale),
          borderColor: colors.map.globeGlowRing,
        }}
      />
    </View>
  );
}
