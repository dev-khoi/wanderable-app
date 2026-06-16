import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';

const NODE_DISTANCE_THRESHOLD_KM = 0.5;
const NODE_TIME_GAP_MS = 2 * 60 * 60 * 1000;
const MISSING_GPS_ATTACH_WINDOW_MS = 3 * 60 * 60 * 1000;

export type ImportedTripMediaDraft = {
  hasGps: boolean;
  latitude: number | null;
  longitude: number | null;
  placementStatus: 'placed' | 'missing_location';
  remoteUrl: string;
  selectionIndex: number;
  sourceAssetId: string | null;
  takenAt: string | null;
  type: 'photo' | 'video';
};

export type ImportedTripNodeDraft = {
  countryName: string;
  daySortOrder: number;
  endsAt: string | null;
  latitude: number;
  locationName: string;
  longitude: number;
  media: ImportedTripMediaDraft[];
  sortOrder: number;
  startsAt: string | null;
  title: string;
};

export type ImportedTripDayDraft = {
  dayDate: string | null;
  dominantLocation: string;
  label: string;
  nodes: ImportedTripNodeDraft[];
  sortOrder: number;
};

export type ImportedTripDraft = {
  days: ImportedTripDayDraft[];
  endsOn: string | null;
  locatedAssetCount: number;
  missingGpsMedia: ImportedTripMediaDraft[];
  missingLocationCount: number;
  startsOn: string | null;
  subtitle: string;
  title: string;
  totalAssetCount: number;
};

type MaybeAssetInfo = Awaited<ReturnType<typeof MediaLibrary.getAssetInfoAsync>> | null;

type MutableNodeCluster = {
  dayKey: string | null;
  gpsCount: number;
  latitudeSum: number;
  lastGpsTakenAtMs: number | null;
  longitudeSum: number;
  media: ImportedTripMediaDraft[];
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
};

type ResolvedLocationLabel = {
  countryName: string;
  locationName: string;
  title: string;
};

export async function buildTripImportDraftFromAssets(
  assets: ImagePicker.ImagePickerAsset[],
): Promise<ImportedTripDraft> {
  const resolvedAssets = (
    await Promise.all(assets.map((asset, selectionIndex) => resolvePickedAsset(asset, selectionIndex)))
  ).sort(compareImportedMediaByTime);

  const locatedAssets = resolvedAssets.filter(
    (asset): asset is ImportedTripMediaDraft & { latitude: number; longitude: number } =>
      asset.latitude != null && asset.longitude != null,
  );

  if (locatedAssets.length === 0) {
    return {
      days: [],
      endsOn: null,
      locatedAssetCount: 0,
      missingGpsMedia: resolvedAssets.map((asset) => ({
        ...asset,
        placementStatus: 'missing_location',
      })),
      missingLocationCount: resolvedAssets.length,
      startsOn: null,
      subtitle: 'No mapped stops yet',
      title: 'Imported trip',
      totalAssetCount: resolvedAssets.length,
    };
  }

  const nodeClusters = buildInitialNodeClusters(locatedAssets);
  const missingGpsMedia: ImportedTripMediaDraft[] = [];

  for (const asset of resolvedAssets) {
    if (asset.latitude != null && asset.longitude != null) {
      continue;
    }

    const attached = attachMissingGpsMedia(nodeClusters, asset);

    if (!attached) {
      missingGpsMedia.push({ ...asset, placementStatus: 'missing_location' });
    }
  }

  const finalizedDays = await finalizeDayDrafts(nodeClusters);
  const firstKnownDay = finalizedDays.find((day) => day.dayDate)?.dayDate ?? null;
  const lastKnownDay = [...finalizedDays].reverse().find((day) => day.dayDate)?.dayDate ?? null;
  const firstNode = finalizedDays[0]?.nodes[0] ?? null;
  const firstLocation = firstNode?.locationName.split(',')[0]?.trim() ?? null;

  return {
    days: finalizedDays,
    endsOn: lastKnownDay,
    locatedAssetCount: locatedAssets.length,
    missingGpsMedia,
    missingLocationCount: missingGpsMedia.length,
    startsOn: firstKnownDay,
    subtitle: firstNode?.locationName ?? 'Imported from your photo metadata',
    title: firstLocation ? `${firstLocation} trip` : 'Imported trip',
    totalAssetCount: resolvedAssets.length,
  };
}

export async function resolvePickedAssetTakenAt(asset: ImagePicker.ImagePickerAsset) {
  const assetInfo = await getAssetInfo(asset.assetId);

  return getTakenAt(asset, assetInfo);
}

function buildInitialNodeClusters(
  locatedAssets: Array<ImportedTripMediaDraft & { latitude: number; longitude: number }>,
) {
  const clusters: MutableNodeCluster[] = [];

  for (const asset of locatedAssets) {
    const cluster = clusters.at(-1);

    if (!cluster || shouldStartNewNodeCluster(cluster, asset)) {
      clusters.push(createNodeCluster(asset, clusters.length));
      continue;
    }

    addMediaToCluster(cluster, asset);
  }

  return clusters;
}

function attachMissingGpsMedia(clusters: MutableNodeCluster[], asset: ImportedTripMediaDraft) {
  const assetTakenAtMs = toTimeMs(asset.takenAt);
  const assetDayKey = getDayKey(asset.takenAt);

  if (assetTakenAtMs == null || !assetDayKey) {
    return false;
  }

  let bestCluster: MutableNodeCluster | null = null;
  let bestGap = Number.POSITIVE_INFINITY;

  for (const cluster of clusters) {
    if (cluster.dayKey !== assetDayKey) {
      continue;
    }

    const gap = getClusterTimeGapMs(cluster, assetTakenAtMs);

    if (gap <= MISSING_GPS_ATTACH_WINDOW_MS && gap < bestGap) {
      bestCluster = cluster;
      bestGap = gap;
    }
  }

  if (!bestCluster) {
    return false;
  }

  addMediaToCluster(bestCluster, { ...asset, placementStatus: 'placed' });

  return true;
}

async function finalizeDayDrafts(clusters: MutableNodeCluster[]) {
  const dayDrafts: ImportedTripDayDraft[] = [];
  let activeDayKey: string | null | undefined;
  let activeDay: ImportedTripDayDraft | null = null;

  for (const cluster of clusters) {
    if (!activeDay || activeDayKey !== cluster.dayKey) {
      activeDay = {
        dayDate: cluster.dayKey,
        dominantLocation: '',
        label: `Day ${dayDrafts.length + 1}`,
        nodes: [],
        sortOrder: dayDrafts.length,
      };
      activeDayKey = cluster.dayKey;
      dayDrafts.push(activeDay);
    }

    const latitude = cluster.latitudeSum / cluster.gpsCount;
    const longitude = cluster.longitudeSum / cluster.gpsCount;
    const labels = await resolveLocationLabel(latitude, longitude, cluster.sortOrder);
    const nodeDraft: ImportedTripNodeDraft = {
      countryName: labels.countryName,
      daySortOrder: activeDay.sortOrder,
      endsAt: cluster.endsAt,
      latitude,
      locationName: labels.locationName,
      longitude,
      media: [...cluster.media].sort(compareImportedMediaByTime),
      sortOrder: cluster.sortOrder,
      startsAt: cluster.startsAt,
      title: labels.title,
    };

    activeDay.nodes.push(nodeDraft);

    if (!activeDay.dominantLocation) {
      activeDay.dominantLocation = nodeDraft.locationName;
    }
  }

  return dayDrafts;
}

function createNodeCluster(
  asset: ImportedTripMediaDraft & { latitude: number; longitude: number },
  sortOrder: number,
): MutableNodeCluster {
  return {
    dayKey: getDayKey(asset.takenAt),
    gpsCount: 1,
    latitudeSum: asset.latitude,
    lastGpsTakenAtMs: toTimeMs(asset.takenAt),
    longitudeSum: asset.longitude,
    media: [asset],
    sortOrder,
    startsAt: asset.takenAt,
    endsAt: asset.takenAt,
  };
}

function addMediaToCluster(cluster: MutableNodeCluster, asset: ImportedTripMediaDraft) {
  cluster.media.push(asset);

  if (asset.latitude != null && asset.longitude != null) {
    cluster.latitudeSum += asset.latitude;
    cluster.longitudeSum += asset.longitude;
    cluster.gpsCount += 1;

    const assetTakenAtMs = toTimeMs(asset.takenAt);

    if (assetTakenAtMs != null) {
      cluster.lastGpsTakenAtMs = assetTakenAtMs;
    }
  }

  cluster.startsAt = pickEarlierIso(cluster.startsAt, asset.takenAt);
  cluster.endsAt = pickLaterIso(cluster.endsAt, asset.takenAt);
}

function shouldStartNewNodeCluster(
  cluster: MutableNodeCluster,
  asset: ImportedTripMediaDraft & { latitude: number; longitude: number },
) {
  const assetDayKey = getDayKey(asset.takenAt);

  if (cluster.dayKey !== assetDayKey) {
    return true;
  }

  const center: [number, number] = [cluster.longitudeSum / cluster.gpsCount, cluster.latitudeSum / cluster.gpsCount];
  const distanceKm = haversineKm(center, [asset.longitude, asset.latitude]);

  if (distanceKm > NODE_DISTANCE_THRESHOLD_KM) {
    return true;
  }

  const previousTakenAtMs = cluster.lastGpsTakenAtMs;
  const nextTakenAtMs = toTimeMs(asset.takenAt);

  return previousTakenAtMs != null && nextTakenAtMs != null
    ? nextTakenAtMs - previousTakenAtMs > NODE_TIME_GAP_MS
    : false;
}

function getClusterTimeGapMs(cluster: MutableNodeCluster, assetTakenAtMs: number) {
  const startMs = toTimeMs(cluster.startsAt);
  const endMs = toTimeMs(cluster.endsAt);

  if (startMs == null && endMs == null) {
    return Number.POSITIVE_INFINITY;
  }

  if (startMs != null && assetTakenAtMs < startMs) {
    return startMs - assetTakenAtMs;
  }

  if (endMs != null && assetTakenAtMs > endMs) {
    return assetTakenAtMs - endMs;
  }

  return 0;
}

async function resolvePickedAsset(
  asset: ImagePicker.ImagePickerAsset,
  selectionIndex: number,
): Promise<ImportedTripMediaDraft> {
  const assetInfo = await getAssetInfo(asset.assetId);
  const coordinate = getCoordinate(asset, assetInfo);

  return {
    hasGps: coordinate != null,
    latitude: coordinate?.latitude ?? null,
    longitude: coordinate?.longitude ?? null,
    placementStatus: coordinate ? 'placed' : 'missing_location',
    remoteUrl: asset.uri,
    selectionIndex,
    sourceAssetId: asset.assetId ?? null,
    takenAt: getTakenAt(asset, assetInfo),
    type: asset.type === 'video' ? 'video' : 'photo',
  };
}

async function getAssetInfo(assetId?: string | null): Promise<MaybeAssetInfo> {
  if (!assetId) {
    return null;
  }

  try {
    return await MediaLibrary.getAssetInfoAsync(assetId, {
      shouldDownloadFromNetwork: false,
    });
  } catch {
    return null;
  }
}

function getTakenAt(asset: ImagePicker.ImagePickerAsset, assetInfo: MaybeAssetInfo) {
  const creationTime = assetInfo?.creationTime;

  if (typeof creationTime === 'number' && Number.isFinite(creationTime) && creationTime > 0) {
    return new Date(creationTime).toISOString();
  }

  const exif = getExifRecord(asset);
  const exifDateTime =
    (typeof exif?.DateTimeOriginal === 'string' && exif.DateTimeOriginal) ||
    (typeof exif?.DateTimeDigitized === 'string' && exif.DateTimeDigitized) ||
    (typeof exif?.DateTime === 'string' && exif.DateTime) ||
    null;

  if (!exifDateTime) {
    return null;
  }

  const normalized = exifDateTime.replace(/^([0-9]{4}):([0-9]{2}):([0-9]{2})/, '$1-$2-$3');
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function getCoordinate(asset: ImagePicker.ImagePickerAsset, assetInfo: MaybeAssetInfo) {
  const infoLocation =
    assetInfo && 'location' in assetInfo && assetInfo.location
      ? assetInfo.location
      : null;

  if (
    infoLocation &&
    typeof infoLocation.latitude === 'number' &&
    typeof infoLocation.longitude === 'number'
  ) {
    return {
      latitude: infoLocation.latitude,
      longitude: infoLocation.longitude,
    };
  }

  const exif = getExifRecord(asset);
  const latitude = parseExifCoordinate(exif?.GPSLatitude ?? exif?.latitude, exif?.GPSLatitudeRef ?? exif?.latitudeRef);
  const longitude = parseExifCoordinate(
    exif?.GPSLongitude ?? exif?.longitude,
    exif?.GPSLongitudeRef ?? exif?.longitudeRef,
  );

  return latitude != null && longitude != null ? { latitude, longitude } : null;
}

function getExifRecord(asset: ImagePicker.ImagePickerAsset) {
  return typeof asset.exif === 'object' && asset.exif ? (asset.exif as Record<string, unknown>) : null;
}

function parseExifCoordinate(value: unknown, ref: unknown) {
  const decimal = normalizeCoordinateValue(value);

  if (decimal == null) {
    return null;
  }

  const normalizedRef = typeof ref === 'string' ? ref.toUpperCase() : null;

  if (normalizedRef === 'S' || normalizedRef === 'W') {
    return -Math.abs(decimal);
  }

  return decimal;
}

function normalizeCoordinateValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parts = value
      .split(/[^0-9.\-]+/)
      .map((part) => Number(part))
      .filter((part) => Number.isFinite(part));

    return decimalFromCoordinateParts(parts);
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((part) => (typeof part === 'number' ? part : Number(part)))
      .filter((part) => Number.isFinite(part));

    return decimalFromCoordinateParts(parts);
  }

  return null;
}

function decimalFromCoordinateParts(parts: number[]) {
  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    return parts[0] ?? null;
  }

  const degrees = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const seconds = parts[2] ?? 0;
  const sign = degrees < 0 ? -1 : 1;

  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
}

async function resolveLocationLabel(
  latitude: number,
  longitude: number,
  sortOrder: number,
): Promise<ResolvedLocationLabel> {
  try {
    const placemarks = await Location.reverseGeocodeAsync({ latitude, longitude });
    const placemark = placemarks[0];
    const locality =
      placemark?.city?.trim() ||
      placemark?.district?.trim() ||
      placemark?.subregion?.trim() ||
      placemark?.region?.trim() ||
      '';
    const countryName = placemark?.country?.trim() || '';
    const locationName = [locality, countryName].filter(Boolean).join(', ');
    const title = locality || countryName || `Stop ${sortOrder + 1}`;

    return {
      countryName,
      locationName: locationName || formatCoordinateLabel(latitude, longitude),
      title,
    };
  } catch {
    const fallback = formatCoordinateLabel(latitude, longitude);

    return {
      countryName: '',
      locationName: fallback,
      title: `Stop ${sortOrder + 1}`,
    };
  }
}

function formatCoordinateLabel(latitude: number, longitude: number) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

function compareImportedMediaByTime(left: ImportedTripMediaDraft, right: ImportedTripMediaDraft) {
  if (left.takenAt && right.takenAt) {
    return left.takenAt.localeCompare(right.takenAt);
  }

  if (left.takenAt) {
    return -1;
  }

  if (right.takenAt) {
    return 1;
  }

  return left.selectionIndex - right.selectionIndex;
}

function pickEarlierIso(current: string | null, next: string | null) {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  return current.localeCompare(next) <= 0 ? current : next;
}

function pickLaterIso(current: string | null, next: string | null) {
  if (!current) {
    return next;
  }

  if (!next) {
    return current;
  }

  return current.localeCompare(next) >= 0 ? current : next;
}

function getDayKey(takenAt: string | null) {
  if (!takenAt) {
    return null;
  }

  const date = new Date(takenAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toTimeMs(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();

  return Number.isNaN(parsed) ? null : parsed;
}

function haversineKm([lng1, lat1]: [number, number], [lng2, lat2]: [number, number]) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
