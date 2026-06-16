import { supabase } from "@/lib/supabase";

import type { ImportedTripDraft } from "./import";
import type {
  RouteSegment,
  TripDay,
  TripMedia,
  TripNode,
  TripSummaryViewModel,
  TripViewModel,
} from "./types";

const DEFAULT_TRIP_MEDIA_BUCKET = "trip-media";

type TripRow = {
  id: string;
  owner_user_id: string;
  title: string;
  subtitle: string | null;
  starts_on: string | null;
  ends_on: string | null;
  cover_media_id: string | null;
  updated_at: string;
};

type ProfileRow = {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
};

type TripDayRow = {
  id: string;
  sort_order: number;
  label: string;
  day_date: string | null;
  dominant_location: string | null;
  cover_media_id: string | null;
};

type TripNodeRow = {
  id: string;
  trip_day_id: string;
  sort_order: number;
  title: string;
  location_name: string;
  country_name: string | null;
  latitude: number;
  longitude: number;
  starts_at: string | null;
  ends_at: string | null;
};

type NewNodeMediaInput = {
  hasGps: boolean;
  placementStatus: TripMedia["placementStatus"];
  remoteUrl: string;
  sortOrder: number;
  sourceAssetId?: string | null;
  takenAt: string | null;
  type: TripMedia["type"];
};

type MediaItemRow = {
  id: string;
  node_id: string | null;
  media_type: "photo" | "video" | "audio";
  storage_path: string | null;
  remote_url: string | null;
  sort_order: number;
  taken_at: string | null;
  has_gps: boolean;
  placement_status: "placed" | "missing_location" | "skipped";
};

type VoiceNoteRow = {
  node_id: string;
  duration_seconds: number | null;
};

type RouteSegmentRow = {
  id: string;
  from_node_id: string;
  to_node_id: string;
  transport_mode: RouteSegment["transport"];
};

type InsertedTripDayRow = {
  id: string;
  sort_order: number;
};

type InsertedTripNodeRow = {
  id: string;
  sort_order: number;
};

type InsertedMediaRow = {
  id: string;
  node_id: string | null;
};

function formatDateRange(startsOn: string | null, endsOn: string | null) {
  if (!startsOn && !endsOn) {
    return "Dates coming soon";
  }

  const start = startsOn ? new Date(`${startsOn}T00:00:00Z`) : null;
  const end = endsOn ? new Date(`${endsOn}T00:00:00Z`) : null;

  if (start && end) {
    const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
    const startLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
      timeZone: "UTC",
    }).format(start);
    const endLabel = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(end);

    return `${startLabel} - ${endLabel}`;
  }

  const only = start ?? end;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(only!);
}

function formatShortDate(date: string | null) {
  if (!date) {
    return "Date TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatSummaryDate(dateRange: string) {
  if (dateRange === "Dates coming soon") {
    return dateRange;
  }

  const [firstChunk] = dateRange.split("-");

  return firstChunk?.trim() ?? dateRange;
}

function formatTimeRange(startsAt: string | null, endsAt: string | null) {
  if (!startsAt && !endsAt) {
    return "Time TBD";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (startsAt && endsAt) {
    return `${formatter.format(new Date(startsAt))} - ${formatter.format(new Date(endsAt))}`;
  }

  return formatter.format(new Date(startsAt ?? endsAt!));
}

function formatDurationLabel(startsOn: string | null, endsOn: string | null, dayCount: number) {
  if (startsOn && endsOn) {
    const start = new Date(`${startsOn}T00:00:00Z`);
    const end = new Date(`${endsOn}T00:00:00Z`);
    const days = Math.max(
      1,
      Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1,
    );

    return `${days} day${days === 1 ? "" : "s"}`;
  }

  return `${Math.max(dayCount, 1)} day${dayCount === 1 ? "" : "s"}`;
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

function formatDistanceLabel(nodes: TripNode[]) {
  if (nodes.length < 2) {
    return "0 km";
  }

  let distance = 0;

  for (let index = 1; index < nodes.length; index += 1) {
    distance += haversineKm(nodes[index - 1]!.coordinate, nodes[index]!.coordinate);
  }

  return `${Math.round(distance)} km`;
}

function getOwnerName(profile: ProfileRow | null) {
  if (profile?.full_name?.trim()) {
    return profile.full_name.trim();
  }

  const parts = [profile?.first_name?.trim(), profile?.last_name?.trim()].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "Traveler";
}

function getCountriesLabel(nodes: TripNode[]) {
  const countries = new Set(
    nodes.map((node) => node.country).filter((value) => value.length > 0),
  );
  const count = countries.size;

  return `${count} countr${count === 1 ? "y" : "ies"}`;
}

function getLocationLabel(days: TripDay[], nodes: TripNode[]) {
  const fromDay = days.find((day) => day.dominantLocation.length > 0)?.dominantLocation;

  if (fromDay) {
    return fromDay;
  }

  return nodes[0]?.locationName ?? "Unknown location";
}

function getZoomStops(nodes: TripNode[]) {
  const country = nodes.find((node) => node.country.length > 0)?.country ?? "Trip";
  const focus = nodes[0]?.locationName.split(",")[0]?.trim() || "City";

  return ["Globe", country, focus];
}

function resolveStoragePublicUrl(storagePath: string) {
  const normalized = storagePath.replace(/^\/+/, "");

  if (normalized.length === 0) {
    return null;
  }

  const [maybeBucket, ...rest] = normalized.split("/");
  const bucket = rest.length > 0 ? maybeBucket : DEFAULT_TRIP_MEDIA_BUCKET;
  const objectPath = rest.length > 0 ? rest.join("/") : normalized;
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);

  return data.publicUrl;
}

function resolveMediaUri(item: Pick<MediaItemRow, "storage_path" | "remote_url">) {
  if (item.remote_url) {
    return item.remote_url;
  }

  if (item.storage_path) {
    return resolveStoragePublicUrl(item.storage_path);
  }

  return null;
}

function mapMedia(item: MediaItemRow): TripMedia | null {
  if (item.media_type === "audio") {
    return null;
  }

  return {
    id: item.id,
    type: item.media_type,
    uri: resolveMediaUri(item),
    takenAt: item.taken_at,
    hasGps: item.has_gps,
    placementStatus: item.placement_status,
  };
}

function mapTripViewModel(input: {
  trip: TripRow;
  profile: ProfileRow | null;
  days: TripDayRow[];
  nodes: TripNodeRow[];
  mediaItems: MediaItemRow[];
  voiceNotes: VoiceNoteRow[];
  routeSegments: RouteSegmentRow[];
}): TripViewModel {
  const mediaByNodeId = new Map<string, TripMedia[]>();
  const missingGpsMedia: TripMedia[] = [];

  for (const mediaItem of input.mediaItems) {
    const media = mapMedia(mediaItem);

    if (!media) {
      continue;
    }

    if (mediaItem.node_id) {
      const nodeMedia = mediaByNodeId.get(mediaItem.node_id) ?? [];
      nodeMedia.push(media);
      mediaByNodeId.set(mediaItem.node_id, nodeMedia);
    } else if (mediaItem.placement_status === "missing_location") {
      missingGpsMedia.push(media);
    }
  }

  for (const mediaList of mediaByNodeId.values()) {
    mediaList.sort((left, right) => {
      if (left.takenAt && right.takenAt) {
        return left.takenAt.localeCompare(right.takenAt);
      }

      return left.id.localeCompare(right.id);
    });
  }

  const voiceByNodeId = new Map(
    input.voiceNotes.map((voiceNote) => [voiceNote.node_id, voiceNote.duration_seconds ?? undefined]),
  );

  const days: TripDay[] = input.days.map((day) => ({
    id: day.id,
    label: day.label,
    date: formatShortDate(day.day_date),
    dominantLocation: day.dominant_location ?? "",
    coverMediaId: day.cover_media_id,
  }));

  const nodes: TripNode[] = input.nodes.map((node) => {
    const media = mediaByNodeId.get(node.id) ?? [];

    return {
      id: node.id,
      dayId: node.trip_day_id,
      title: node.title,
      locationName: node.location_name,
      country: node.country_name ?? "",
      timeRange: formatTimeRange(node.starts_at, node.ends_at),
      coordinate: [node.longitude, node.latitude],
      photoCount: media.length,
      voiceNoteSeconds: voiceByNodeId.get(node.id),
      media,
    };
  });

  const routeSegments: RouteSegment[] = input.routeSegments.map((segment) => ({
    id: segment.id,
    fromNodeId: segment.from_node_id,
    toNodeId: segment.to_node_id,
    transport: segment.transport_mode,
  }));

  const coverMedia = input.trip.cover_media_id
    ? input.mediaItems.find((mediaItem) => mediaItem.id === input.trip.cover_media_id)
    : input.mediaItems.find((mediaItem) => mediaItem.node_id != null);

  return {
    id: input.trip.id,
    ownerName: getOwnerName(input.profile),
    title: input.trip.title,
    subtitle: input.trip.subtitle ?? getLocationLabel(days, nodes),
    dateRange: formatDateRange(input.trip.starts_on, input.trip.ends_on),
    durationLabel: formatDurationLabel(input.trip.starts_on, input.trip.ends_on, days.length),
    distanceLabel: formatDistanceLabel(nodes),
    countriesLabel: getCountriesLabel(nodes),
    coverUri: coverMedia ? resolveMediaUri(coverMedia) : null,
    zoomStops: getZoomStops(nodes),
    days,
    nodes,
    routeSegments,
    missingGpsMedia,
  };
}

async function getTripIdOrThrow(userId: string, tripId?: string) {
  if (tripId) {
    return tripId;
  }

  const { data, error } = await supabase
    .from("trips")
    .select("id")
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function fetchTripViewModel(userId: string, tripId?: string) {
  const resolvedTripId = await getTripIdOrThrow(userId, tripId);

  if (!resolvedTripId) {
    return null;
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, owner_user_id, title, subtitle, starts_on, ends_on, cover_media_id, updated_at")
    .eq("id", resolvedTripId)
    .single();

  if (tripError) {
    throw tripError;
  }

  const [profileResult, daysResult, nodesResult, mediaResult, voiceResult, routesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, first_name, last_name")
      .eq("id", trip.owner_user_id)
      .maybeSingle(),
    supabase
      .from("trip_days")
      .select("id, sort_order, label, day_date, dominant_location, cover_media_id")
      .eq("trip_id", resolvedTripId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("trip_nodes")
      .select("id, trip_day_id, sort_order, title, location_name, country_name, latitude, longitude, starts_at, ends_at")
      .eq("trip_id", resolvedTripId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("media_items")
      .select("id, node_id, media_type, storage_path, remote_url, sort_order, taken_at, has_gps, placement_status")
      .eq("trip_id", resolvedTripId)
      .order("sort_order", { ascending: true })
      .order("taken_at", { ascending: true }),
    supabase
      .from("voice_notes")
      .select("node_id, duration_seconds")
      .eq("trip_id", resolvedTripId),
    supabase
      .from("route_segments")
      .select("id, from_node_id, to_node_id, transport_mode")
      .eq("trip_id", resolvedTripId)
      .order("sort_order", { ascending: true }),
  ]);

  for (const result of [daysResult, nodesResult, mediaResult, voiceResult, routesResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  if (profileResult.error) {
    throw profileResult.error;
  }

  return mapTripViewModel({
    trip,
    profile: profileResult.data,
    days: (daysResult.data ?? []) as TripDayRow[],
    nodes: (nodesResult.data ?? []) as TripNodeRow[],
    mediaItems: (mediaResult.data ?? []) as MediaItemRow[],
    voiceNotes: (voiceResult.data ?? []) as VoiceNoteRow[],
    routeSegments: (routesResult.data ?? []) as RouteSegmentRow[],
  });
}

export async function fetchLatestTripSummary(userId: string): Promise<TripSummaryViewModel | null> {
  const trip = await fetchTripViewModel(userId);

  if (!trip) {
    return null;
  }

  return mapTripSummaryViewModel(trip);
}

export async function fetchTripSummaries(userId: string): Promise<TripSummaryViewModel[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("id")
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  const trips = await Promise.all(
    (data ?? []).map(async ({ id }) => fetchTripViewModel(userId, id)),
  );

  return trips
    .filter((trip): trip is TripViewModel => trip != null)
    .map(mapTripSummaryViewModel);
}

function mapTripSummaryViewModel(trip: TripViewModel): TripSummaryViewModel {
  return {
    id: trip.id,
    ownerName: trip.ownerName,
    title: trip.title,
    subtitle: trip.subtitle,
    dateRange: formatSummaryDate(trip.dateRange),
    durationLabel: trip.durationLabel,
    distanceLabel: trip.distanceLabel,
    coverUri: trip.coverUri,
    locationLabel: trip.subtitle,
    nodes: trip.nodes,
    routeSegments: trip.routeSegments,
  };
}

export async function updateTripTitle(tripId: string, title: string) {
  const nextTitle = title.trim();

  if (!nextTitle) {
    throw new Error("Trip title cannot be empty.");
  }

  const { error } = await supabase.from("trips").update({ title: nextTitle }).eq("id", tripId);

  if (error) {
    throw error;
  }
}

export async function updateRouteSegmentTransport(segmentId: string, transport: RouteSegment["transport"]) {
  const { error } = await supabase
    .from("route_segments")
    .update({ transport_mode: transport })
    .eq("id", segmentId);

  if (error) {
    throw error;
  }
}

export async function addNodeMediaItems({
  mediaItems,
  nodeId,
  ownerUserId,
  tripId,
}: {
  mediaItems: NewNodeMediaInput[];
  nodeId: string;
  ownerUserId: string;
  tripId: string;
}) {
  const { data, error } = await supabase
    .from("media_items")
    .insert(
      mediaItems.map((item) => ({
        has_gps: item.hasGps,
        media_type: item.type,
        node_id: nodeId,
        owner_user_id: ownerUserId,
        placement_status: item.placementStatus,
        remote_url: item.remoteUrl,
        sort_order: item.sortOrder,
        source_asset_id: item.sourceAssetId ?? null,
        taken_at: item.takenAt,
        trip_id: tripId,
      })),
    )
    .select(
      "id, node_id, media_type, storage_path, remote_url, sort_order, taken_at, has_gps, placement_status",
    );

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapMedia).filter((item): item is TripMedia => item != null);
}

export async function createImportedDraftTrip({
  draft,
  ownerUserId,
}: {
  draft: ImportedTripDraft;
  ownerUserId: string;
}) {
  if (draft.days.length === 0) {
    throw new Error("At least one GPS-tagged photo is required to create a mapped trip.");
  }

  let createdTripId: string | null = null;

  try {
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        ends_on: draft.endsOn,
        owner_user_id: ownerUserId,
        starts_on: draft.startsOn,
        subtitle: draft.subtitle,
        title: draft.title,
      })
      .select("id")
      .single();

    if (tripError) {
      throw tripError;
    }

    createdTripId = trip.id;

    const { data: insertedDays, error: dayError } = await supabase
      .from("trip_days")
      .insert(
        draft.days.map((day) => ({
          day_date: day.dayDate,
          dominant_location: day.dominantLocation,
          label: day.label,
          sort_order: day.sortOrder,
          trip_id: trip.id,
        })),
      )
      .select("id, sort_order");

    if (dayError) {
      throw dayError;
    }

    const dayIdBySortOrder = new Map(
      ((insertedDays ?? []) as InsertedTripDayRow[]).map((day) => [day.sort_order, day.id]),
    );
    const nodeDrafts = draft.days.flatMap((day) => day.nodes);
    const nodeInsertRows = nodeDrafts.map((node) => ({
      country_name: node.countryName || null,
      ends_at: node.endsAt,
      latitude: node.latitude,
      location_name: node.locationName,
      longitude: node.longitude,
      sort_order: node.sortOrder,
      starts_at: node.startsAt,
      title: node.title,
      trip_day_id: dayIdBySortOrder.get(node.daySortOrder),
      trip_id: trip.id,
    }));

    if (nodeInsertRows.some((row) => !row.trip_day_id)) {
      throw new Error("Trip day mapping failed during trip import.");
    }

    const { data: insertedNodes, error: nodeError } = await supabase
      .from("trip_nodes")
      .insert(nodeInsertRows)
      .select("id, sort_order");

    if (nodeError) {
      throw nodeError;
    }

    const nodeIdBySortOrder = new Map(
      ((insertedNodes ?? []) as InsertedTripNodeRow[]).map((node) => [node.sort_order, node.id]),
    );
    const routeRows = nodeDrafts.slice(1).map((node, index) => ({
      from_node_id: nodeIdBySortOrder.get(nodeDrafts[index]!.sortOrder),
      sort_order: index,
      to_node_id: nodeIdBySortOrder.get(node.sortOrder),
      transport_mode: "none" as RouteSegment["transport"],
      trip_id: trip.id,
    }));

    if (routeRows.some((row) => !row.from_node_id || !row.to_node_id)) {
      throw new Error("Route reconstruction failed during trip import.");
    }

    if (routeRows.length > 0) {
      const { error: routeError } = await supabase.from("route_segments").insert(routeRows);

      if (routeError) {
        throw routeError;
      }
    }

    const placedMediaRows = nodeDrafts.flatMap((node) => {
      const nodeId = nodeIdBySortOrder.get(node.sortOrder);

      return node.media.map((media, mediaIndex) => ({
        captured_latitude: media.latitude,
        captured_longitude: media.longitude,
        has_gps: media.hasGps,
        media_type: media.type,
        node_id: nodeId,
        owner_user_id: ownerUserId,
        placement_status: media.placementStatus,
        remote_url: media.remoteUrl,
        sort_order: mediaIndex,
        source_asset_id: media.sourceAssetId,
        taken_at: media.takenAt,
        trip_id: trip.id,
      }));
    });
    const unplacedMediaRows = draft.missingGpsMedia.map((media, mediaIndex) => ({
      captured_latitude: media.latitude,
      captured_longitude: media.longitude,
      has_gps: media.hasGps,
      media_type: media.type,
      node_id: null,
      owner_user_id: ownerUserId,
      placement_status: media.placementStatus,
      remote_url: media.remoteUrl,
      sort_order: mediaIndex,
      source_asset_id: media.sourceAssetId,
      taken_at: media.takenAt,
      trip_id: trip.id,
    }));
    const mediaRows = [...placedMediaRows, ...unplacedMediaRows];

    if (mediaRows.length > 0) {
      const { data: insertedMedia, error: mediaError } = await supabase
        .from("media_items")
        .insert(mediaRows)
        .select("id, node_id");

      if (mediaError) {
        throw mediaError;
      }

      const coverMediaId = (insertedMedia as InsertedMediaRow[] | null)?.find(
        (media) => media.node_id != null,
      )?.id;

      if (coverMediaId) {
        const { error: coverError } = await supabase
          .from("trips")
          .update({ cover_media_id: coverMediaId })
          .eq("id", trip.id);

        if (coverError) {
          throw coverError;
        }
      }
    }

    return trip.id;
  } catch (error) {
    if (createdTripId) {
      await supabase.from("trips").delete().eq("id", createdTripId);
    }

    throw error;
  }
}

export async function deleteTrip({
  ownerUserId,
  tripId,
}: {
  ownerUserId: string;
  tripId: string;
}) {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", tripId)
    .eq("owner_user_id", ownerUserId);

  if (error) {
    throw error;
  }
}

export async function updateNodeMediaSortOrder(nodeId: string, mediaIdsInOrder: string[]) {
  await Promise.all(
    mediaIdsInOrder.map((mediaId, sortOrder) =>
      supabase
        .from("media_items")
        .update({ sort_order: sortOrder })
        .eq("id", mediaId)
        .eq("node_id", nodeId),
    ),
  ).then((results) => {
    const firstError = results.find((result) => result.error)?.error;

    if (firstError) {
      throw firstError;
    }
  });
}
