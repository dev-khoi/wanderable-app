import { Image, Pressable, Text, View } from "react-native";

import type { TripNode } from "@/lib/trips/types";

import { colors } from "./constants";
import type { RNMapboxModule } from "./types";

type TripMapNodesProps = {
  Mapbox: RNMapboxModule;
  activeNodeId: string;
  coverImageUri?: string | null;
  dayNumberByDayId: Map<string, number>;
  markerVariant: "detailed" | "compact";
  nodes: TripNode[];
  onSelectNode: (nodeId: string) => void;
  scale: number;
};

export function TripMapNodes({
  Mapbox,
  activeNodeId,
  coverImageUri,
  dayNumberByDayId,
  markerVariant,
  nodes,
  onSelectNode,
  scale,
}: TripMapNodesProps) {
  const { MarkerView } = Mapbox;

  return (
    <>
      {nodes.map((node) => {
        const isActive = node.id === activeNodeId;
        const compactSize = 14 * scale;
        const size = isActive ? 58 * scale : 44 * scale;
        const dayNumber = dayNumberByDayId.get(node.dayId) ?? 1;
        const markerImageUri = isActive
          ? coverImageUri ?? node.media[0]?.uri
          : node.media[0]?.uri;

        if (markerVariant === "compact") {
          return (
            <MarkerView
              key={node.id}
              coordinate={node.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              allowOverlap
              allowOverlapWithPuck>
              <View
                style={{
                  width: compactSize,
                  height: compactSize,
                  borderRadius: compactSize / 2,
                  backgroundColor: isActive
                    ? colors.brand.secondary
                    : colors.map.inactivePin,
                  borderWidth: Math.max(1, scale),
                  borderColor: colors.map.pinBorder,
                  opacity: isActive ? 1 : 0.92,
                }}
              />
            </MarkerView>
          );
        }

        return (
          <MarkerView
            key={node.id}
            coordinate={node.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            allowOverlap
            allowOverlapWithPuck>
            <Pressable
              accessibilityRole="button"
              className="items-center justify-center"
              onPress={() => onSelectNode(node.id)}>
              <View
                style={{
                  position: "absolute",
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: isActive
                    ? colors.map.activePin
                    : colors.map.inactivePin,
                  opacity: isActive ? 0.24 : 0.88,
                }}
              />
              {markerImageUri ? (
                <Image
                  source={{ uri: markerImageUri }}
                  resizeMode="cover"
                  style={{
                    width: size * 0.74,
                    height: size * 0.74,
                    borderRadius: size * 0.37,
                    borderWidth: 3 * scale,
                    borderColor: colors.map.pinBorder,
                    backgroundColor: colors.surface.muted,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: size * 0.74,
                    height: size * 0.74,
                    borderRadius: size * 0.37,
                    borderWidth: 3 * scale,
                    borderColor: colors.map.pinBorder,
                    backgroundColor: colors.surface.muted,
                  }}
                />
              )}
              <View
                className="absolute items-center justify-center"
                style={{
                  right: -2 * scale,
                  bottom: 1 * scale,
                  width: 18 * scale,
                  height: 18 * scale,
                  borderRadius: 9 * scale,
                  backgroundColor: colors.brand.secondary,
                  borderWidth: 2 * scale,
                  borderColor: colors.map.pinBorder,
                }}>
                <Text
                  className="font-extrabold"
                  style={{ fontSize: 8 * scale, color: colors.text.inverse }}>
                  {dayNumber}
                </Text>
              </View>
            </Pressable>
          </MarkerView>
        );
      })}
    </>
  );
}
