import * as Location from "expo-location";
import { Image, Platform } from "react-native";
import { useEffect, useMemo, useState } from "react";

import type { TripViewModel } from "@/lib/trips/types";

export function useTripViewState(
  trip: TripViewModel | null,
  options?: { preferViewerLocation?: boolean },
) {
  const preferViewerLocation = options?.preferViewerLocation ?? true;
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [viewerCoordinate, setViewerCoordinate] = useState<
    [number, number] | null
  >(null);
  const [shouldUseViewerLocation, setShouldUseViewerLocation] = useState(
    preferViewerLocation,
  );

  useEffect(() => {
    if (!trip) {
      setActiveNodeId(null);
      return;
    }

    setActiveNodeId((currentNodeId) => {
      if (currentNodeId && trip.nodes.some((node) => node.id === currentNodeId)) {
        return currentNodeId;
      }

      return trip.nodes[0]?.id ?? null;
    });
    setZoomIndex(Math.min(2, Math.max(trip.zoomStops.length - 1, 0)));
    setIsStoryOpen(false);
    setShouldUseViewerLocation(preferViewerLocation);
  }, [preferViewerLocation, trip]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }

    let isMounted = true;

    async function loadViewerLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) {
          return;
        }

        setViewerCoordinate([
          location.coords.longitude,
          location.coords.latitude,
        ]);
      } catch {
        // Keep the existing trip-centered fallback when location is unavailable.
      }
    }

    void loadViewerLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeNode = useMemo(() => {
    if (!trip) {
      return null;
    }

    return trip.nodes.find((node) => node.id === activeNodeId) ?? trip.nodes[0] ?? null;
  }, [activeNodeId, trip]);

  const activeIndex = useMemo(() => {
    if (!trip || !activeNode) {
      return 0;
    }

    return Math.max(
      0,
      trip.nodes.findIndex((node) => node.id === activeNode.id),
    );
  }, [activeNode, trip]);

  const activeMedia = activeNode?.media[0] ?? null;
  const activeRouteSegment = useMemo(() => {
    if (!trip || !activeNode) {
      return null;
    }

    return trip.routeSegments.find((segment) => segment.toNodeId === activeNode.id) ?? null;
  }, [activeNode, trip]);

  useEffect(() => {
    if (!trip || !activeNode) {
      return;
    }

    const uris = [
      activeNode.media[0]?.uri,
      trip.nodes[activeIndex - 1]?.media[0]?.uri,
      trip.nodes[activeIndex + 1]?.media[0]?.uri,
    ].filter((uri): uri is string => typeof uri === "string" && uri.length > 0);

    for (const uri of uris) {
      // Android image prefetch can reject on transient network resets; keep the
      // visible trip view working instead of surfacing unhandled promise noise.
      void Image.prefetch(uri).catch(() => undefined);
    }
  }, [activeIndex, activeNode, trip]);

  const goToNode = (nodeId: string) => {
    if (!trip) {
      return;
    }

    setShouldUseViewerLocation(false);
    setActiveNodeId(nodeId);
    setIsStoryOpen(false);
  };

  const goToStoryNode = (nodeId: string) => {
    if (!trip) {
      return;
    }

    setShouldUseViewerLocation(false);
    setActiveNodeId(nodeId);
    setIsStoryOpen(true);
  };

  const goToNodeByIndex = (index: number) => {
    const nextNode = trip?.nodes[index];

    if (!nextNode) {
      return;
    }

    goToNode(nextNode.id);
  };

  const goToStoryNodeByIndex = (index: number) => {
    const nextNode = trip?.nodes[index];

    if (!nextNode) {
      return;
    }

    goToStoryNode(nextNode.id);
  };

  const goToPreviousNode = () => {
    if (!trip || trip.nodes.length === 0) {
      return;
    }

    goToNodeByIndex(Math.max(0, activeIndex - 1));
  };

  const goToNextNode = () => {
    if (!trip || trip.nodes.length === 0) {
      return;
    }

    goToNodeByIndex(Math.min(trip.nodes.length - 1, activeIndex + 1));
  };

  const goToPreviousStoryNode = () => {
    if (!trip || trip.nodes.length === 0) {
      return;
    }

    goToStoryNodeByIndex(Math.max(0, activeIndex - 1));
  };

  const goToNextStoryNode = () => {
    if (!trip || trip.nodes.length === 0) {
      return;
    }

    goToStoryNodeByIndex(Math.min(trip.nodes.length - 1, activeIndex + 1));
  };

  return {
    activeIndex,
    activeMedia,
    activeNode,
    activeRouteSegment,
    closeStory: () => setIsStoryOpen(false),
    goToNextNode,
    goToNextStoryNode,
    goToNode,
    goToNodeByIndex,
    goToPreviousNode,
    goToPreviousStoryNode,
    isStoryOpen,
    mapInitialCenterCoordinate: shouldUseViewerLocation ? viewerCoordinate : null,
    openStory: () => setIsStoryOpen(true),
    selectedZoomLabel: trip?.zoomStops[zoomIndex] ?? "City",
    setZoomIndex,
    trip,
    zoomIndex,
  };
}
