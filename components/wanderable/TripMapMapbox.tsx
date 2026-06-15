import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import type { TripNode } from "@/lib/trips/types";

import {
  CITY_ZOOM_LEVEL,
  GLOBE_OVERVIEW_ZOOM_LEVEL,
  GLOBE_ROTATION_LOCK_ZOOM_LEVEL,
  mapboxAccessToken,
} from "./trip-map-mapbox/constants";
import {
  buildDayNumberByDayId,
  buildRouteLines,
  buildRouteShape,
  buildTripCenterCoordinate,
} from "./trip-map-mapbox/geometry";
import { getMapboxModule } from "./trip-map-mapbox/useMapboxModule";
import { TripMapGlobeOverlay } from "./trip-map-mapbox/TripMapGlobeOverlay";
import { TripMapNodes } from "./trip-map-mapbox/TripMapNodes";
import { TripMapRouteLabels } from "./trip-map-mapbox/TripMapRouteLabels";
import { TripMapRouteLayer } from "./trip-map-mapbox/TripMapRouteLayer";
import { TripMapStatusScreen } from "./trip-map-mapbox/TripMapStatusScreen";
import type { TripMapProps } from "./trip-map-mapbox/types";

export function TripMapMapbox({
  activeNodeId,
  allNodes,
  allowGlobeSpin = false,
  coverImageUri,
  initialCenterCoordinate,
  lockGlobe = false,
  mapContentTranslateY = 0,
  markerVariant = "detailed",
  nodes,
  routeSegments,
  scale,
  selectedZoomLabel,
  showRouteLabels = true,
  tripDays,
  onSelectNode,
}: TripMapProps) {
  const Mapbox = getMapboxModule();
  const hasAppliedInitialCenterRef = useRef(false);
  const cameraRef = useRef<any>(null);
  const wasGlobeOverviewRef = useRef(false);
  const [currentZoom, setCurrentZoom] = useState(CITY_ZOOM_LEVEL);
  const safeAllNodes = useMemo(
    () => allNodes.filter((node): node is TripNode => !!node),
    [allNodes],
  );
  const safeNodes = useMemo(
    () => nodes.filter((node): node is TripNode => !!node),
    [nodes],
  );
  const safeRouteSegments = useMemo(
    () => routeSegments.filter(Boolean),
    [routeSegments],
  );
  const safeTripDays = useMemo(() => tripDays.filter(Boolean), [tripDays]);
  const nodeById = useMemo(
    () => new Map(safeAllNodes.map((node) => [node.id, node])),
    [safeAllNodes],
  );
  const dayNumberByDayId = useMemo(
    () => buildDayNumberByDayId(safeTripDays),
    [safeTripDays],
  );
  const routeLines = useMemo(
    () => buildRouteLines(safeRouteSegments, nodeById),
    [nodeById, safeRouteSegments],
  );
  const routeShape = useMemo(() => buildRouteShape(routeLines), [routeLines]);
  const tripCenterCoordinate = useMemo(
    () => buildTripCenterCoordinate(safeAllNodes),
    [safeAllNodes],
  );
  const isGlobeOverview = currentZoom <= GLOBE_ROTATION_LOCK_ZOOM_LEVEL;
  const canSpinLockedGlobe = lockGlobe && allowGlobeSpin && isGlobeOverview;

  useEffect(() => {
    if (!Mapbox) {
      return;
    }

    const activeNode =
      safeAllNodes.find((node) => node.id === activeNodeId) ?? safeAllNodes[0];

    if (selectedZoomLabel === "Globe" || lockGlobe) {
      cameraRef.current?.setCamera({
        centerCoordinate: tripCenterCoordinate,
        zoomLevel: GLOBE_OVERVIEW_ZOOM_LEVEL,
        pitch: 0,
        heading: 0,
        animationMode: "flyTo",
        animationDuration: 1200,
      });
      return;
    }

    if (!activeNode) {
      return;
    }

    if (selectedZoomLabel === "Japan") {
      cameraRef.current?.setCamera({
        centerCoordinate: [137.4, 36.0],
        zoomLevel: 3.6,
        pitch: 34,
        heading: -14,
        animationMode: "flyTo",
        animationDuration: 1200,
      });
      return;
    }

    if (initialCenterCoordinate && !hasAppliedInitialCenterRef.current) {
      hasAppliedInitialCenterRef.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: initialCenterCoordinate,
        zoomLevel: CITY_ZOOM_LEVEL,
        pitch: 0,
        heading: 0,
        animationMode: "flyTo",
        animationDuration: 900,
      });
      return;
    }

    cameraRef.current?.setCamera({
      centerCoordinate: activeNode.coordinate,
      zoomLevel: CITY_ZOOM_LEVEL,
      pitch: 48,
      heading: 12,
      animationMode: "flyTo",
      animationDuration: 950,
    });
  }, [
    Mapbox,
    activeNodeId,
    safeAllNodes,
    initialCenterCoordinate,
    lockGlobe,
    selectedZoomLabel,
    tripCenterCoordinate,
  ]);

  useEffect(() => {
    if (!Mapbox) {
      return;
    }

    if (isGlobeOverview && !wasGlobeOverviewRef.current) {
      cameraRef.current?.setCamera({
        heading: 0,
        pitch: 0,
        animationMode: "easeTo",
        animationDuration: 260,
      });
    }

    wasGlobeOverviewRef.current = isGlobeOverview;
  }, [Mapbox, isGlobeOverview]);

  if (!mapboxAccessToken) {
    return (
      <TripMapStatusScreen
        scale={scale}
        title="Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to use the real Mapbox trip view."
      />
    );
  }

  if (!Mapbox) {
    return (
      <TripMapStatusScreen
        scale={scale}
        title="Mapbox native code is not available in this build."
        body="Use an Expo dev build after installing @rnmapbox/maps. Expo Go cannot load this native module."
      />
    );
  }

  const { Camera, MapView, StyleURL } = Mapbox;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1, transform: [{ translateY: mapContentTranslateY }] }}
        styleURL={StyleURL.SatelliteStreet}
        projection="globe"
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        rotateEnabled={canSpinLockedGlobe || (!lockGlobe && !isGlobeOverview)}
        pitchEnabled={!lockGlobe && !isGlobeOverview}
        scrollEnabled={canSpinLockedGlobe || !lockGlobe}
        zoomEnabled={!lockGlobe}
        
        onCameraChanged={(state) => {
          const nextZoom = state.properties.zoom;

          setCurrentZoom((zoom) =>
            Math.abs(zoom - nextZoom) < 0.02 ? zoom : nextZoom,
          );
        }}>
        <Camera
          ref={cameraRef}
          minZoomLevel={0}
          maxZoomLevel={lockGlobe ? GLOBE_OVERVIEW_ZOOM_LEVEL : undefined}
          zoomLevel={lockGlobe ? GLOBE_OVERVIEW_ZOOM_LEVEL : CITY_ZOOM_LEVEL}
          centerCoordinate={
            initialCenterCoordinate ?? safeAllNodes[0]?.coordinate ?? tripCenterCoordinate
          }
          pitch={lockGlobe ? 0 : 48}
          heading={lockGlobe ? 0 : 12}

        />
        <TripMapRouteLayer
          Mapbox={Mapbox}
          hasRoute={routeLines.length > 0}
          markerVariant={markerVariant}
          routeShape={routeShape}
        />
        <TripMapNodes
          Mapbox={Mapbox}
          activeNodeId={activeNodeId}
          coverImageUri={coverImageUri}
          dayNumberByDayId={dayNumberByDayId}
          markerVariant={markerVariant}
          nodes={safeNodes}
          onSelectNode={onSelectNode}
          scale={scale}
        />
        <TripMapRouteLabels
          Mapbox={Mapbox}
          nodeById={nodeById}
          routeSegments={safeRouteSegments}
          scale={scale}
          showRouteLabels={showRouteLabels}
        />
      </MapView>

      {isGlobeOverview ? (
        <TripMapGlobeOverlay scale={scale} translateY={mapContentTranslateY} />
      ) : null}
    </View>
  );
}

export type { TripMapProps } from "./trip-map-mapbox/types";
