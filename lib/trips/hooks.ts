import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/auth";

import type { ImportedTripDraft } from "./import";
import type { TransportMode } from "./types";

import {
  addNodeMediaItems,
  createImportedDraftTrip,
  deleteTrip,
  fetchLatestTripSummary,
  fetchTripSummaries,
  fetchTripViewModel,
  updateNodeMediaSortOrder,
  updateRouteSegmentTransport,
  updateTripTitle,
} from "./queries";

export const tripQueryKeys = {
  latestSummary: (userId?: string) => ["trips", "latest-summary", userId] as const,
  summaries: (userId?: string) => ["trips", "summaries", userId] as const,
  view: (userId?: string, tripId?: string) => ["trips", "view", userId, tripId ?? "latest"] as const,
};

function useInvalidateTripQueries(tripId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.latestSummary(user?.id) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.summaries(user?.id) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.view(user?.id, tripId) }),
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.view(user?.id, undefined) }),
    ]);
  };
}

export function useLatestTripSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: tripQueryKeys.latestSummary(user?.id),
    queryFn: () => fetchLatestTripSummary(user!.id),
    enabled: !!user?.id,
  });
}

export function useTripSummaries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: tripQueryKeys.summaries(user?.id),
    queryFn: () => fetchTripSummaries(user!.id),
    enabled: !!user?.id,
  });
}

export function useTripViewData(tripId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: tripQueryKeys.view(user?.id, tripId),
    queryFn: () => fetchTripViewModel(user!.id, tripId),
    enabled: !!user?.id,
  });
}

export function useUpdateTripTitle(tripId?: string) {
  const invalidate = useInvalidateTripQueries(tripId);

  return useMutation({
    mutationFn: ({ nextTitle, tripId: targetTripId }: { nextTitle: string; tripId: string }) =>
      updateTripTitle(targetTripId, nextTitle),
    onSuccess: invalidate,
  });
}

export function useUpdateRouteSegmentTransport(tripId?: string) {
  const invalidate = useInvalidateTripQueries(tripId);

  return useMutation({
    mutationFn: ({ segmentId, transport }: { segmentId: string; transport: TransportMode }) =>
      updateRouteSegmentTransport(segmentId, transport),
    onSuccess: invalidate,
  });
}

export function useAddNodeMediaItems(tripId?: string) {
  const { user } = useAuth();
  const invalidate = useInvalidateTripQueries(tripId);

  return useMutation({
    mutationFn: ({
      mediaItems,
      nodeId,
      tripId: targetTripId,
    }: {
      mediaItems: Array<{
        hasGps: boolean;
        placementStatus: "placed" | "missing_location" | "skipped";
        remoteUrl: string;
        sortOrder: number;
        sourceAssetId?: string | null;
        takenAt: string | null;
        type: "photo" | "video";
      }>;
      nodeId: string;
      tripId: string;
    }) =>
      addNodeMediaItems({
        mediaItems,
        nodeId,
        ownerUserId: user!.id,
        tripId: targetTripId,
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateNodeMediaSortOrder(tripId?: string) {
  const invalidate = useInvalidateTripQueries(tripId);

  return useMutation({
    mutationFn: ({ mediaIdsInOrder, nodeId }: { mediaIdsInOrder: string[]; nodeId: string }) =>
      updateNodeMediaSortOrder(nodeId, mediaIdsInOrder),
    onSuccess: invalidate,
  });
}

export function useCreateImportedDraftTrip() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draft: ImportedTripDraft) =>
      createImportedDraftTrip({
        draft,
        ownerUserId: user!.id,
      }),
    onSuccess: async (tripId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.view(user?.id, tripId) }),
      ]);
    },
  });
}

export function useDeleteTrip(tripId?: string) {
  const { user } = useAuth();
  const invalidate = useInvalidateTripQueries(tripId);

  return useMutation({
    mutationFn: ({ tripId: targetTripId }: { tripId: string }) =>
      deleteTrip({
        ownerUserId: user!.id,
        tripId: targetTripId,
      }),
    onSuccess: invalidate,
  });
}
