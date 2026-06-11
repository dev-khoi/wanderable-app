import { Platform, Text, View } from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";

import { TripMapMapbox, type TripMapProps } from "./TripMapMapbox";

const { colors } = wanderableTheme;

function TripMapFallback({ scale }: Pick<TripMapProps, "scale">) {
  const body =
    Platform.OS === "web"
      ? "Web keeps a lightweight fallback because @rnmapbox/maps in this Expo app targets native first."
      : "Use an Expo dev build after installing @rnmapbox/maps. Expo Go cannot load this native module.";

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: colors.background.deepSpace }}>
      <Text
        className="text-center font-extrabold"
        style={{ fontSize: 18 * scale, color: colors.text.inverse }}>
        Mapbox trip view is enabled for iOS and Android dev builds.
      </Text>
      <Text
        className="mt-3 text-center font-semibold"
        style={{ fontSize: 12 * scale, color: colors.text.inverse }}>
        {body}
      </Text>
    </View>
  );
}

export function TripMap(props: TripMapProps) {
  // if (Platform.OS === 'web' || NativeModules.RNMBXModule == null) {
  //   return <TripMapFallback scale={props.scale} />;
  // }

  return <TripMapMapbox {...props} />;
}

export type { TripMapProps } from "./TripMapMapbox";
