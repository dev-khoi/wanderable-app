import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ActionButton,
  EditHeader,
  EditSheet,
  HighlightCard,
  PhotoGridEditor,
  SectionHeading,
} from "@/components/trip-edit";
import { wanderableTheme } from "@/constants/wanderableTheme";
import {
  useAddNodeMediaItems,
  useTripViewData,
  useUpdateNodeMediaSortOrder,
} from "@/lib/trips/hooks";
import { resolvePickedAssetTakenAt } from "@/lib/trips/import";
import { type TripMedia as MediaItem } from "@/lib/trips/types";

const { colors } = wanderableTheme;

export default function HighlightEditScreen() {
  const { nodeId, tripId } = useLocalSearchParams<{
    nodeId?: string;
    tripId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const tripQuery = useTripViewData(tripId);
  const trip = tripQuery.data;
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const addNodeMediaItemsMutation = useAddNodeMediaItems(tripId);
  const updateSortOrderMutation = useUpdateNodeMediaSortOrder(tripId);
  const [isPickingPhotos, setIsPickingPhotos] = useState(false);
  const [localMedia, setLocalMedia] = useState<MediaItem[]>([]);

  const activeNode =
    trip?.nodes.find((node) => node.id === nodeId) ?? trip?.nodes[0] ?? null;

  useEffect(() => {
    setLocalMedia(activeNode?.media ?? []);
  }, [activeNode?.id, activeNode?.media]);

  if (tripQuery.isLoading) {
    return (
      <HighlightEditStatus
        scale={scale}
        title="Loading highlight"
        body="Pulling photos and story order from Supabase."
      />
    );
  }

  if (!trip || tripQuery.error || !activeNode) {
    return (
      <HighlightEditStatus
        scale={scale}
        title="Highlight unavailable"
        body="We couldn't load this highlight right now."
      />
    );
  }

  const gridWidth = Math.min(s(331), width - s(44));
  const isMutating =
    isPickingPhotos ||
    addNodeMediaItemsMutation.isPending ||
    updateSortOrderMutation.isPending;

  const updateMedia = (updater: (media: MediaItem[]) => MediaItem[]) => {
    const nextMedia = updater(localMedia);
    setLocalMedia(nextMedia);
    updateSortOrderMutation.mutate({
      nodeId: activeNode.id,
      mediaIdsInOrder: nextMedia.map((media) => media.id),
    });
  };

  const addPhotos = async () => {
    if (!activeNode || isMutating) {
      return;
    }

    setIsPickingPhotos(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo access needed",
          "Allow Wanderable to open your library so you can add photos to this highlight.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        exif: true,
        mediaTypes: ["images"],
        orderedSelection: true,
        quality: 1,
        selectionLimit: 0,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const insertedMedia = await addNodeMediaItemsMutation.mutateAsync({
        nodeId: activeNode.id,
        tripId: trip.id,
        mediaItems: (
          await Promise.all(
            result.assets.map(async (asset, index) => ({
              hasGps: true,
              placementStatus: "placed" as const,
              remoteUrl: asset.uri,
              sortOrder: localMedia.length + index,
              sourceAssetId: asset.assetId,
              takenAt: await resolvePickedAssetTakenAt(asset),
              type: asset.type === "video" ? ("video" as const) : ("photo" as const),
            })),
          )
        ).sort(comparePendingMediaByTime),
      });

      const nextMedia = [...localMedia, ...insertedMedia].sort(compareMediaByTime);

      setLocalMedia(nextMedia);

      const nextMediaIds = nextMedia
        .sort(compareMediaByTime)
        .map((media) => media.id);

      await updateSortOrderMutation.mutateAsync({
        nodeId: activeNode.id,
        mediaIdsInOrder: nextMediaIds,
      });
    } catch {
      Alert.alert(
        "Couldn't add photos",
        "Try importing those photos again in a moment.",
      );
    } finally {
      setIsPickingPhotos(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#D6D3DB" }}>
      <View
        className="absolute left-0 right-0 top-0"
        style={{ height: insets.top + s(210), backgroundColor: "#D1CED6" }}
      />
      <EditHeader
        title="edit"
        top={insets.top}
        onBack={() =>
          router.replace({
            pathname: "/trip-edit",
            params: { tripId: trip.id },
          })
        }
        scale={scale}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + s(94),
          paddingBottom: s(32),
          minHeight: height,
        }}>
        <View style={{ paddingHorizontal: s(20), zIndex: 2 }}>
          <HighlightCard
            coverUri={localMedia[0]?.uri ?? null}
            dateLabel=""
            locationName={activeNode.locationName}
            timeRange={`${localMedia.length} story photo${localMedia.length === 1 ? "" : "s"}`}
            title={activeNode.title}
            scale={scale}
          />
        </View>

        <EditSheet
          style={{
            marginTop: s(-54),
            minHeight: s(520),
            paddingHorizontal: s(20),
            paddingTop: s(82),
            paddingBottom: s(28),
          }}>
          <View>
            <SectionHeading
              body="Drag the photo cards by their handle to set the story order."
              title="Stories"
              scale={scale}
            />
            <View style={{ marginTop: s(16), gap: s(10) }}>
              <ActionButton
                title={isPickingPhotos ? "Adding photos..." : "+ Add photos"}
                onPress={addPhotos}
                disabled={isMutating}
                scale={scale}
              />
              <ActionButton
                title="Sort everything by default"
                tone="soft"
                onPress={() =>
                  updateMedia((currentMedia) => [...currentMedia].sort(compareMediaByTime))
                }
                disabled={isMutating || localMedia.length < 2}
                scale={scale}
              />
            </View>
            {localMedia.length > 0 ? (
              <View className="mt-4 self-center">
                <PhotoGridEditor
                  items={localMedia}
                  width={gridWidth}
                  scale={scale}
                  onReorder={(media) => updateMedia(() => media)}
                />
              </View>
            ) : (
              <View
                className="mt-4 rounded-[24px] bg-[#F6F4F8]"
                style={{ padding: s(18) }}>
                <Text
                  className="font-extrabold"
                  style={{ fontSize: s(14), color: colors.text.primary }}>
                  No story photos yet.
                </Text>
                <Text
                  className="mt-2 font-semibold"
                  style={{
                    fontSize: s(12),
                    lineHeight: s(18),
                    color: colors.text.muted,
                  }}>
                  Story photos will show up here once the highlight has media.
                </Text>
              </View>
            )}
          </View>
        </EditSheet>
      </ScrollView>
    </View>
  );
}

function HighlightEditStatus({
  body,
  scale,
  title,
}: {
  body: string;
  scale: number;
  title: string;
}) {
  const s = (value: number) => value * scale;

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: colors.background.surface }}>
      {title === "Loading highlight" ? (
        <ActivityIndicator color={colors.brand.primary} />
      ) : null}
      <Text
        className="mt-4 font-extrabold"
        style={{ fontSize: s(22), color: colors.text.primary }}>
        {title}
      </Text>
      <Text
        className="mt-3 text-center font-semibold"
        style={{
          fontSize: s(13),
          lineHeight: s(19),
          color: colors.text.muted,
        }}>
        {body}
      </Text>
    </View>
  );
}

function compareMediaByTime(left: MediaItem, right: MediaItem) {
  if (left.takenAt && right.takenAt) {
    return left.takenAt.localeCompare(right.takenAt);
  }

  return left.id.localeCompare(right.id);
}

function comparePendingMediaByTime(
  left: { takenAt: string | null; sourceAssetId?: string | null },
  right: { takenAt: string | null; sourceAssetId?: string | null },
) {
  if (left.takenAt && right.takenAt) {
    return left.takenAt.localeCompare(right.takenAt);
  }

  return (left.sourceAssetId ?? "").localeCompare(right.sourceAssetId ?? "");
}
