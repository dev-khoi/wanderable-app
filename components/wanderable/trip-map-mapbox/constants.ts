import { wanderableTheme } from "@/constants/wanderableTheme";
import type { TransportMode } from "@/lib/trips/types";

export const { colors } = wanderableTheme;
export const mapboxAccessToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const CITY_ZOOM_LEVEL = 8.8;
export const GLOBE_OVERVIEW_ZOOM_LEVEL = 0.6;
export const GLOBE_ROTATION_LOCK_ZOOM_LEVEL = 1.2;

export const transportLabels: Record<TransportMode, string> = {
  car: "car",
  bike: "bike",
  walk: "walk",
  fly: "fly",
  none: "",
};
