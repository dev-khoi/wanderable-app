import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";
import {
  type RouteSegment,
  type TransportMode,
  type TripNode,
} from "@/lib/mockData";

const { colors } = wanderableTheme;
const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
const CITY_ZOOM_LEVEL = 8.8;
const GLOBE_OVERVIEW_ZOOM_LEVEL = 0.6;
const GLOBE_ROTATION_LOCK_ZOOM_LEVEL = 1.2;

const transportLabels: Record<TransportMode, string> = {
  car: "car",
  bike: "bike",
  walk: "walk",
  fly: "fly",
  none: "",
};

type RNMapboxModule = typeof import("@rnmapbox/maps");

function getMapboxModule(): RNMapboxModule | null {
  try {
    const module = require("@rnmapbox/maps") as RNMapboxModule;

    if (mapboxAccessToken) {
      module.setAccessToken(mapboxAccessToken);
    }

    return module;
  } catch {
    return null;
  }
}

export type TripMapProps = {
  activeNodeId: string;
  allNodes: TripNode[];
  nodes: TripNode[];
  routeSegments: RouteSegment[];
  scale: number;
  selectedZoomLabel: string;
  onSelectNode: (nodeId: string) => void;
};

export function TripMapMapbox({
  activeNodeId,
  allNodes,
  nodes,
  routeSegments,
  scale,
  selectedZoomLabel,
  onSelectNode,
}: TripMapProps) {
  if (!mapboxAccessToken) {
    return <Text>Error</Text>;
  }
  const Mapbox = getMapboxModule();
  const cameraRef = useRef<any>(null);
  const wasGlobeOverviewRef = useRef(false);
  const [currentZoom, setCurrentZoom] = useState(CITY_ZOOM_LEVEL);
  const nodeById = useMemo(
    () => new Map(allNodes.map((node) => [node.id, node])),
    [allNodes],
  );
  const isGlobeOverview = currentZoom <= GLOBE_ROTATION_LOCK_ZOOM_LEVEL;
  const tripCenterCoordinate = useMemo<[number, number]>(() => {
    if (allNodes.length === 0) {
      return [0, 20];
    }

    const [totalLongitude, totalLatitude] = allNodes.reduce(
      ([longitude, latitude], node) => [
        longitude + node.coordinate[0],
        latitude + node.coordinate[1],
      ],
      [0, 0],
    );

    return [
      totalLongitude / allNodes.length,
      totalLatitude / allNodes.length,
    ];
  }, [allNodes]);

  const routeShape = useMemo(() => {
    const coordinates = routeSegments
      .map((segment) => nodeById.get(segment.fromNodeId)?.coordinate)
      .filter(Boolean) as [number, number][];
    const lastCoordinate =
      routeSegments.length > 0
        ? nodeById.get(routeSegments[routeSegments.length - 1]?.toNodeId)
            ?.coordinate
        : undefined;

    if (lastCoordinate) {
      coordinates.push(lastCoordinate);
    }

    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    } as const;
  }, [nodeById, routeSegments]);

  useEffect(() => {
    if (!Mapbox) {
      return;
    }

    const activeNode =
      allNodes.find((node) => node.id === activeNodeId) ?? allNodes[0];

    if (!activeNode) {
      return;
    }

    if (selectedZoomLabel === "Globe") {
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

    cameraRef.current?.setCamera({
      centerCoordinate: activeNode.coordinate,
      zoomLevel: CITY_ZOOM_LEVEL,
      pitch: 48,
      heading: 12,
      animationMode: "flyTo",
      animationDuration: 950,
    });
  }, [Mapbox, activeNodeId, allNodes, selectedZoomLabel, tripCenterCoordinate]);

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
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background.deepSpace }}>
        <Text
          className="text-center font-extrabold"
          style={{ fontSize: 18 * scale, color: colors.text.inverse }}>
          Add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN to use the real Mapbox trip view.
        </Text>
      </View>
    );
  }

  if (!Mapbox) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background.deepSpace }}>
        <Text
          className="text-center font-extrabold"
          style={{ fontSize: 18 * scale, color: colors.text.inverse }}>
          Mapbox native code is not available in this build.
        </Text>
        <Text
          className="mt-3 text-center font-semibold"
          style={{ fontSize: 12 * scale, color: colors.text.inverse }}>
          Use an Expo dev build after installing @rnmapbox/maps. Expo Go cannot
          load this native module.
        </Text>
      </View>
    );
  }

  const { Camera, LineLayer, MapView, MarkerView, ShapeSource, StyleURL } =
    Mapbox;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        styleURL={StyleURL.SatelliteStreet}
        projection="globe"
        compassEnabled={false}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        rotateEnabled={!isGlobeOverview}
        pitchEnabled={!isGlobeOverview}
        scrollEnabled
        zoomEnabled
        onCameraChanged={(state) => {
          const nextZoom = state.properties.zoom;

          setCurrentZoom((zoom) =>
            Math.abs(zoom - nextZoom) < 0.02 ? zoom : nextZoom,
          );
        }}>
        <Camera
          ref={cameraRef}
          minZoomLevel={0}
          zoomLevel={CITY_ZOOM_LEVEL}
          centerCoordinate={allNodes[0]?.coordinate}
          pitch={48}
          heading={12}
        />
        {routeShape.geometry.coordinates.length >= 2 ? (
          <ShapeSource id="trip-route-source" shape={routeShape}>
            <LineLayer
              id="trip-route-line"
              style={{
                lineColor: colors.map.route,
                lineWidth: 4,
                lineBlur: 0.4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </ShapeSource>
        ) : null}
        {nodes.map((node) => {
          const isActive = node.id === activeNodeId;
          const size = isActive ? 58 * scale : 44 * scale;

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
                <Image
                  source={{ uri: node.media[0]?.uri }}
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
                    {node.photoCount}
                  </Text>
                </View>
              </Pressable>
            </MarkerView>
          );
        })}
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
      </MapView>

      {isGlobeOverview ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center">
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
      ) : null}
    </View>
  );
}
