import type { RouteSegment, TripDay, TripNode } from "@/lib/trips/types";

export type RNMapboxModule = typeof import("@rnmapbox/maps");

export type TripMapProps = {
  activeNodeId: string;
  allNodes: TripNode[];
  allowGlobeSpin?: boolean;
  coverImageUri?: string | null;
  initialCenterCoordinate?: [number, number] | null;
  lockGlobe?: boolean;
  mapContentTranslateY?: number;
  markerVariant?: "detailed" | "compact";
  nodes: TripNode[];
  routeSegments: RouteSegment[];
  scale: number;
  selectedZoomLabel: string;
  showRouteLabels?: boolean;
  tripDays: TripDay[];
  onSelectNode: (nodeId: string) => void;
};
