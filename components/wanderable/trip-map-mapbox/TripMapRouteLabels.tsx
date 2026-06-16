import { Text, View } from "react-native";

import type { RouteSegment, TripNode } from "@/lib/trips/types";

import { colors, transportLabels } from "./constants";
import type { RNMapboxModule } from "./types";

type TripMapRouteLabelsProps = {
  Mapbox: RNMapboxModule;
  nodeById: Map<string, TripNode>;
  routeSegments: RouteSegment[];
  scale: number;
  showRouteLabels: boolean;
};

export function TripMapRouteLabels({
  Mapbox,
  nodeById,
  routeSegments,
  scale,
  showRouteLabels,
}: TripMapRouteLabelsProps) {
  if (!showRouteLabels) {
    return null;
  }

  const { MarkerView } = Mapbox;

  return (
    <>
      {routeSegments.map((segment) => {
        const fromNode = nodeById.get(segment.fromNodeId);
        const toNode = nodeById.get(segment.toNodeId);
        const label = transportLabels[segment.transport];

        if (!fromNode || !toNode || !label) {
          return null;
        }

        const midpoint: [number, number] = [
          (fromNode.coordinate[0] + toNode.coordinate[0]) / 2,
          (fromNode.coordinate[1] + toNode.coordinate[1]) / 2,
        ];

        return (
          <MarkerView
            key={`${segment.id}-label`}
            coordinate={midpoint}
            anchor={{ x: 0.5, y: 0.5 }}
            allowOverlap
            allowOverlapWithPuck>
            <View
              className="items-center justify-center rounded-full"
              style={{
                minWidth: 42 * scale,
                height: 24 * scale,
                paddingHorizontal: 8 * scale,
                backgroundColor: colors.surface.glass,
              }}>
              <Text
                className="font-extrabold"
                style={{ fontSize: 9 * scale, color: colors.text.primary }}>
                {label}
              </Text>
            </View>
          </MarkerView>
        );
      })}
    </>
  );
}
