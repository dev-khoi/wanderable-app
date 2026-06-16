import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActionButton,
  EditHeader,
  EditSheet,
  HighlightCard,
  MetaPill,
  SectionHeading,
} from '@/components/trip-edit';
import { ImportStopEditor, getImportedMediaId } from '@/components/trip-import';
import { wanderableTheme } from '@/constants/wanderableTheme';
import { useCreateImportedDraftTrip } from '@/lib/trips/hooks';
import {
  buildTripImportDraftFromAssets,
  type ImportedTripDraft,
  type ImportedTripMediaDraft,
  type ImportedTripNodeDraft,
} from '@/lib/trips/import';

const { colors } = wanderableTheme;

export default function TripImportScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const createTripMutation = useCreateImportedDraftTrip();
  const [draft, setDraft] = useState<ImportedTripDraft | null>(null);
  const [activeStopKey, setActiveStopKey] = useState<string | null>(null);
  const [hasInitializedStopSelection, setHasInitializedStopSelection] = useState(false);
  const [isPickingPhotos, setIsPickingPhotos] = useState(false);
  const [isAnalyzingPhotos, setIsAnalyzingPhotos] = useState(false);
  const [selectedNodeMediaId, setSelectedNodeMediaId] = useState<string | null>(null);
  const [selectedQueueMediaId, setSelectedQueueMediaId] = useState<string | null>(null);

  const isBusy = isPickingPhotos || isAnalyzingPhotos || createTripMutation.isPending;
  const previewNodes = draft ? draft.days.flatMap((day) => day.nodes.map((node) => ({ day, node }))) : [];
  const placedPhotoCount = previewNodes.reduce((count, entry) => count + entry.node.media.length, 0);
  const activeStop = previewNodes.find(({ node }) => getStopKey(node) === activeStopKey) ?? null;
  const unresolvedLocationCount = previewNodes.filter(({ node }) => stopNeedsLocation(node)).length;
  const canCreateTrip =
    !!draft &&
    draft.days.length > 0 &&
    draft.missingGpsMedia.length === 0 &&
    unresolvedLocationCount === 0 &&
    !isBusy;

  useEffect(() => {
    if (!previewNodes.length) {
      setActiveStopKey(null);
      setHasInitializedStopSelection(false);
      setSelectedNodeMediaId(null);
      setSelectedQueueMediaId(null);
      return;
    }

    if (!hasInitializedStopSelection || (activeStopKey && !previewNodes.some(({ node }) => getStopKey(node) === activeStopKey))) {
      setActiveStopKey(getStopKey(previewNodes[0]!.node));
      setHasInitializedStopSelection(true);
      setSelectedNodeMediaId(null);
      setSelectedQueueMediaId(null);
    }
  }, [activeStopKey, hasInitializedStopSelection, previewNodes]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!draft || createTripMutation.isPending) {
        return false;
      }

      handleAttemptLeave();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [createTripMutation.isPending, draft]);

  const addPhotos = async () => {
    if (isBusy) {
      return;
    }

    setIsPickingPhotos(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Photo access needed',
          'Allow Wanderable to read your library so it can rebuild a draft trip from your photo metadata.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        exif: true,
        mediaTypes: ['images'],
        orderedSelection: true,
        quality: 1,
        selectionLimit: 0,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      setIsAnalyzingPhotos(true);

      const nextDraft = await buildTripImportDraftFromAssets(result.assets);

      setDraft(nextDraft);
      setHasInitializedStopSelection(false);
      setSelectedNodeMediaId(null);
      setSelectedQueueMediaId(null);

      if (nextDraft.days.length === 0) {
        Alert.alert(
          'No mapped stops found',
          'We need at least one photo with GPS metadata to seed the map. Pick photos that were taken with location tagging enabled.',
        );
      }
    } catch {
      Alert.alert(
        'Could not read those photos',
        'Try importing the photos again in a moment.',
      );
    } finally {
      setIsPickingPhotos(false);
      setIsAnalyzingPhotos(false);
    }
  };

  const createTrip = async () => {
    if (!draft || !canCreateTrip) {
      return;
    }

    try {
      const tripId = await createTripMutation.mutateAsync(draft);

      router.replace({
        pathname: '/trip-view',
        params: { tripId },
      });
    } catch {
      Alert.alert(
        'Could not create the trip',
        'The draft could not be saved to Supabase just now. Try again in a moment.',
      );
    }
  };

  const handleAttemptLeave = () => {
    if (!draft || createTripMutation.isPending) {
      router.back();
      return;
    }

    Alert.alert('Discard imported trip?', '', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  const setActiveStopAndResetSelections = (node: ImportedTripNodeDraft) => {
    setActiveStopKey(getStopKey(node));
    setSelectedNodeMediaId(null);
    setSelectedQueueMediaId(null);
  };

  const updateActiveStopLocation = ({
    latitude,
    longitude,
    value,
  }: {
    latitude?: number;
    longitude?: number;
    value: string;
  }) => {
    if (!activeStopKey) {
      return;
    }

    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const nextLocation = value.replace(/\s+/g, ' ').trim();

      return {
        ...currentDraft,
        days: currentDraft.days.map((day) => {
          const nextNodes = day.nodes.map((node) => {
            if (getStopKey(node) !== activeStopKey) {
              return node;
            }

            return {
              ...node,
              latitude: latitude ?? node.latitude,
              locationName: nextLocation,
              longitude: longitude ?? node.longitude,
              title:
                node.title === node.locationName || /^Stop\s+\d+$/i.test(node.title)
                  ? nextLocation.trim() || node.title
                  : node.title,
            };
          });
          const firstNode = nextNodes[0];

          return {
            ...day,
            dominantLocation:
              firstNode && (day.dominantLocation === '' || day.dominantLocation === firstNode.locationName)
                ? firstNode.locationName
                : day.dominantLocation,
            nodes: nextNodes,
          };
        }),
      };
    });
  };

  const assignSelectedQueueMedia = () => {
    if (!activeStopKey || !selectedQueueMediaId) {
      return;
    }

    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      const mediaToAssign = currentDraft.missingGpsMedia.find(
        (media) => getImportedMediaId(media) === selectedQueueMediaId,
      );

      if (!mediaToAssign) {
        return currentDraft;
      }

      const nextMissingMedia = currentDraft.missingGpsMedia.filter(
        (media) => getImportedMediaId(media) !== selectedQueueMediaId,
      );

      return {
        ...currentDraft,
        days: currentDraft.days.map((day) => ({
          ...day,
          nodes: day.nodes.map((node) =>
            getStopKey(node) === activeStopKey
              ? {
                  ...node,
                  media: [
                    ...node.media,
                    {
                      ...mediaToAssign,
                      placementStatus: 'placed' as const,
                    },
                  ],
                }
              : node,
          ),
        })),
        missingGpsMedia: nextMissingMedia,
        missingLocationCount: nextMissingMedia.length,
      };
    });

    setSelectedQueueMediaId(null);
  };

  const returnSelectedNodeMedia = () => {
    if (!activeStopKey || !selectedNodeMediaId) {
      return;
    }

    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      let mediaToReturn: ImportedTripMediaDraft | null = null;
      const nextDays = currentDraft.days.map((day) => ({
        ...day,
        nodes: day.nodes.map((node) => {
          if (getStopKey(node) !== activeStopKey) {
            return node;
          }

          return {
            ...node,
            media: node.media.filter((media) => {
              const matches = getImportedMediaId(media) === selectedNodeMediaId;

              if (matches) {
                mediaToReturn = media;
              }

              return !matches;
            }),
          };
        }),
      }));

      if (!mediaToReturn) {
        return currentDraft;
      }

      const mediaForQueue: ImportedTripMediaDraft = mediaToReturn;

      const nextMissingMedia = [
        ...currentDraft.missingGpsMedia,
        {
          ...mediaForQueue,
          placementStatus: 'missing_location' as const,
        },
      ].sort(compareImportedMediaByTime);

      return {
        ...currentDraft,
        days: nextDays,
        missingGpsMedia: nextMissingMedia,
        missingLocationCount: nextMissingMedia.length,
      };
    });

    setSelectedNodeMediaId(null);
  };

  const reorderActiveStopMedia = (mediaIdsInOrder: string[]) => {
    if (!activeStopKey) {
      return;
    }

    setDraft((currentDraft) => {
      if (!currentDraft) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        days: currentDraft.days.map((day) => ({
          ...day,
          nodes: day.nodes.map((node) => {
            if (getStopKey(node) !== activeStopKey) {
              return node;
            }

            const mediaById = new Map(node.media.map((media) => [getImportedMediaId(media), media]));

            return {
              ...node,
              media: mediaIdsInOrder
                .map((id) => mediaById.get(id))
                .filter((media): media is ImportedTripMediaDraft => !!media),
            };
          }),
        })),
      };
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#D6D3DB' }}>
      <View
        className="absolute left-0 right-0 top-0"
        style={{ height: insets.top + s(224), backgroundColor: '#D1CED6' }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: s(32), minHeight: height }}>
        <EditHeader title="add trip" top={insets.top} onBack={handleAttemptLeave} floating={false} scale={scale} />
        <View style={{ height: s(86) }} />
        <EditSheet
          style={{
            minHeight: height - insets.top - s(88),
            paddingHorizontal: s(20),
            paddingTop: s(26),
            paddingBottom: s(32),
          }}>
          <SectionHeading title="Import media" scale={scale} />

          <View style={{ marginTop: s(16), gap: s(10) }}>
            <ActionButton
              title={
                isPickingPhotos
                  ? 'Opening library...'
                  : isAnalyzingPhotos
                    ? 'Reading metadata...'
                    : '+ Import photos'
              }
              onPress={addPhotos}
              disabled={isBusy}
              scale={scale}
            />
            <ActionButton
              title={createTripMutation.isPending ? 'Creating trip...' : 'Create trip'}
              tone="soft"
              onPress={createTrip}
              disabled={!canCreateTrip}
              scale={scale}
            />
          </View>

          <View className="mt-4 flex-row flex-wrap" style={{ gap: s(10) }}>
            <MetaPill label="Photos" value={String(draft?.totalAssetCount ?? 0)} scale={scale} />
            <MetaPill label="Mapped" value={String(placedPhotoCount)} scale={scale} />
            <MetaPill label="Stops" value={String(previewNodes.length)} scale={scale} />
            <MetaPill label="Unplaced" value={String(draft?.missingLocationCount ?? 0)} scale={scale} />
          </View>

          {isAnalyzingPhotos ? (
            <View
              className="mt-4 items-center rounded-[24px] bg-[#F6F4F8]"
              style={{ padding: s(20) }}>
              <ActivityIndicator color={colors.brand.primary} />
              <Text
                className="mt-3 font-extrabold"
                style={{ fontSize: s(16), color: colors.text.primary }}>
                Rebuilding your itinerary
              </Text>
              <Text
                className="mt-2 text-center font-semibold"
                style={{ fontSize: s(12), lineHeight: s(18), color: colors.text.muted }}>
                Grouping photos into days and mapped highlights from the metadata.
              </Text>
            </View>
          ) : null}

          {draft ? (
            <View style={{ marginTop: s(20), gap: s(18) }}>
              <SectionHeading
                title="Preview"
                body={
                  draft.days.length > 0
                    ? 'Tap a stop to finish photos and location.'
                    : 'We could not find enough metadata to seed map stops from this batch.'
                }
                scale={scale}
              />

              {draft.days.length > 0 ? (
                previewNodes.map(({ day, node }) => (
                  <HighlightCard
                    key={getStopKey(node)}
                    coverUri={node.media[0]?.remoteUrl ?? null}
                    dateLabel={day.dayDate ? `${day.label} - ${formatImportedDay(day.dayDate)}` : `${day.label} - Date TBD`}
                    locationName={node.locationName || 'Add location'}
                    timeRange={`${node.media.length} imported photo${node.media.length === 1 ? '' : 's'}`}
                    title={node.title}
                    scale={scale}
                    onPress={() => setActiveStopAndResetSelections(node)}
                  />
                ))
              ) : (
                <View className="rounded-[24px] bg-[#F6F4F8]" style={{ padding: s(18) }}>
                  <Text
                    className="font-extrabold"
                    style={{ fontSize: s(14), color: colors.text.primary }}>
                    No mapped highlights yet.
                  </Text>
                  <Text
                    className="mt-2 font-semibold"
                    style={{ fontSize: s(12), lineHeight: s(18), color: colors.text.muted }}>
                    Pick photos with location metadata enabled so Wanderable can place them on the map.
                  </Text>
                </View>
              )}

              {activeStop ? (
                <ImportStopEditor
                  editorWidth={width - s(96)}
                  locationValue={activeStop.node.locationName}
                  missingMedia={draft.missingGpsMedia}
                  needsLocation={stopNeedsLocation(activeStop.node)}
                  node={activeStop.node}
                  scale={scale}
                  selectedNodeMediaId={selectedNodeMediaId}
                  selectedQueueMediaId={selectedQueueMediaId}
                  visible={!!activeStop}
                  onAssignSelectedQueueMedia={assignSelectedQueueMedia}
                  onChooseLocation={updateActiveStopLocation}
                  onClose={() => {
                    setActiveStopKey(null);
                    setSelectedNodeMediaId(null);
                    setSelectedQueueMediaId(null);
                  }}
                  onReorderNodeMedia={reorderActiveStopMedia}
                  onReturnSelectedNodeMedia={returnSelectedNodeMedia}
                  onSelectNodeMedia={(mediaId) => {
                    setSelectedNodeMediaId(mediaId);
                    setSelectedQueueMediaId(null);
                  }}
                  onSelectQueueMedia={(mediaId) => {
                    setSelectedQueueMediaId(mediaId);
                    setSelectedNodeMediaId(null);
                  }}
                />
              ) : null}

              {draft.missingLocationCount > 0 || unresolvedLocationCount > 0 ? (
                <View className="rounded-[24px] bg-[#F6F4F8]" style={{ padding: s(18) }}>
                  <Text
                    className="font-extrabold"
                    style={{ fontSize: s(14), color: colors.text.primary }}>
                    {[
                      draft.missingLocationCount > 0
                        ? `${draft.missingLocationCount} photo${draft.missingLocationCount === 1 ? '' : 's'} left`
                        : null,
                      unresolvedLocationCount > 0
                        ? `${unresolvedLocationCount} stop${unresolvedLocationCount === 1 ? '' : 's'} need location`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </EditSheet>
      </ScrollView>
    </View>
  );
}

function getStopKey(node: ImportedTripNodeDraft) {
  return `${node.daySortOrder}:${node.sortOrder}`;
}

function stopNeedsLocation(node: ImportedTripNodeDraft) {
  const locationName = node.locationName.trim();

  return locationName.length === 0 || /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(locationName);
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

function formatImportedDay(dayDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dayDate}T00:00:00Z`));
}
