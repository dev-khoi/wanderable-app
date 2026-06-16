export type TransportMode = "car" | "bike" | "walk" | "fly" | "none";

export type TripMedia = {
  id: string;
  type: "photo" | "video";
  uri: string | null;
  takenAt: string | null;
  hasGps: boolean;
  placementStatus: "placed" | "missing_location" | "skipped";
};

export type TripDay = {
  id: string;
  label: string;
  date: string;
  dominantLocation: string;
  coverMediaId: string | null;
};

export type TripNode = {
  id: string;
  dayId: string;
  title: string;
  locationName: string;
  country: string;
  timeRange: string;
  coordinate: [number, number];
  photoCount: number;
  voiceNoteSeconds?: number;
  media: TripMedia[];
};

export type RouteSegment = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  transport: TransportMode;
};

export type TripViewModel = {
  id: string;
  ownerName: string;
  title: string;
  subtitle: string;
  dateRange: string;
  durationLabel: string;
  distanceLabel: string;
  countriesLabel: string;
  coverUri: string | null;
  zoomStops: string[];
  days: TripDay[];
  nodes: TripNode[];
  routeSegments: RouteSegment[];
  missingGpsMedia: TripMedia[];
};

export type TripSummaryViewModel = {
  id: string;
  ownerName: string;
  title: string;
  subtitle: string;
  dateRange: string;
  durationLabel: string;
  distanceLabel: string;
  coverUri: string | null;
  locationLabel: string;
  nodes: TripNode[];
  routeSegments: RouteSegment[];
};
