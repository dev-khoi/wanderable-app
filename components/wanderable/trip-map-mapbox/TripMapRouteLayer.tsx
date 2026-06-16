import type { RNMapboxModule } from "./types";
import { colors } from "./constants";

type TripMapRouteLayerProps = {
  Mapbox: RNMapboxModule;
  hasRoute: boolean;
  markerVariant: "detailed" | "compact";
  routeShape: any;
};

export function TripMapRouteLayer({
  Mapbox,
  hasRoute,
  markerVariant,
  routeShape,
}: TripMapRouteLayerProps) {
  if (!hasRoute) {
    return null;
  }

  const { LineLayer, ShapeSource } = Mapbox;

  return (
    <ShapeSource id="trip-route-source" shape={routeShape}>
      <LineLayer
        id="trip-route-line"
        style={{
          lineColor: colors.map.route,
          lineOpacity: markerVariant === "compact" ? 0.6 : 1,
          lineWidth: markerVariant === "compact" ? 2.4 : 4,
          lineBlur: 0.4,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    </ShapeSource>
  );
}
