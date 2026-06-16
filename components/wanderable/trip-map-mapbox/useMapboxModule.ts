import type { RNMapboxModule } from "./types";
import { mapboxAccessToken } from "./constants";

let cachedMapboxModule: RNMapboxModule | null | undefined;

export function getMapboxModule(): RNMapboxModule | null {
  if (cachedMapboxModule !== undefined) {
    return cachedMapboxModule;
  }

  try {
    cachedMapboxModule = require("@rnmapbox/maps") as RNMapboxModule;

    if (mapboxAccessToken) {
      cachedMapboxModule.setAccessToken(mapboxAccessToken);
    }

    return cachedMapboxModule;
  } catch {
    cachedMapboxModule = null;
    return null;
  }
}
