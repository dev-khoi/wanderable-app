import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { ActionButton, PhotoGridEditor, SectionHeading } from '@/components/trip-edit';
import { wanderableTheme } from '@/constants/wanderableTheme';
import { mapboxAccessToken } from '@/components/wanderable/trip-map-mapbox/constants';
import { getMapboxModule } from '@/components/wanderable/trip-map-mapbox/useMapboxModule';
import type { ImportedTripMediaDraft, ImportedTripNodeDraft } from '@/lib/trips/import';
import type { TripMedia } from '@/lib/trips/types';

const { colors } = wanderableTheme;

type LocationOption = {
  coordinate?: [number, number];
  label: string;
};

type ImportStopEditorProps = {
  editorWidth: number;
  locationValue: string;
  needsLocation: boolean;
  node: ImportedTripNodeDraft;
  scale: number;
  selectedNodeMediaId: string | null;
  selectedQueueMediaId: string | null;
  visible: boolean;
  missingMedia: ImportedTripMediaDraft[];
  onAssignSelectedQueueMedia: () => void;
  onChooseLocation: (selection: {
    latitude?: number;
    longitude?: number;
    value: string;
  }) => void;
  onClose: () => void;
  onReorderNodeMedia: (mediaIdsInOrder: string[]) => void;
  onReturnSelectedNodeMedia: () => void;
  onSelectNodeMedia: (mediaId: string) => void;
  onSelectQueueMedia: (mediaId: string) => void;
};

export function ImportStopEditor({
  editorWidth,
  locationValue,
  needsLocation,
  node,
  scale,
  selectedNodeMediaId,
  selectedQueueMediaId,
  visible,
  missingMedia,
  onAssignSelectedQueueMedia,
  onChooseLocation,
  onClose,
  onReorderNodeMedia,
  onReturnSelectedNodeMedia,
  onSelectNodeMedia,
  onSelectQueueMedia,
}: ImportStopEditorProps) {
  const s = (value: number) => value * scale;
  const nodeMediaItems = node.media.map(mapImportedMediaToGridItem);
  const queueMediaItems = missingMedia.map(mapImportedMediaToGridItem);
  const Mapbox = getMapboxModule();
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [locationQuery, setLocationQuery] = useState(locationValue);
  const [currentAreaLabel, setCurrentAreaLabel] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapSelection, setMapSelection] = useState<{
    coordinate: [number, number];
    label: string;
  }>({
    coordinate: [node.longitude, node.latitude],
    label: locationValue,
  });

  useEffect(() => {
    setLocationQuery(locationValue);
  }, [locationValue]);

  useEffect(() => {
    if (!visible || !needsLocation) {
      return;
    }

    let isMounted = true;

    async function loadCurrentAreaLabel() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!permission.granted) {
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const placemarks = await Location.reverseGeocodeAsync({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });
        const label = buildLocationOptions(placemarks, '')[0]?.label ?? '';

        if (!isMounted || !label) {
          return;
        }

        setCurrentAreaLabel(label);
        setLocationQuery((currentQuery) =>
          isCoordinateLike(currentQuery) || currentQuery.trim().length === 0 ? label : currentQuery,
        );
      } catch {
        // Keep the location search usable even if the current area cannot be resolved.
      }
    }

    void loadCurrentAreaLabel();

    return () => {
      isMounted = false;
    };
  }, [needsLocation, visible]);

  useEffect(() => {
    setMapSelection({
      coordinate: [node.longitude, node.latitude],
      label: locationValue,
    });
  }, [locationValue, node.latitude, node.longitude, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isMounted = true;

    async function loadLocationOptions() {
      setIsLoadingLocations(true);

      try {
        const query = locationQuery.trim();

        if (query.length >= 2) {
          const permission = await Location.requestForegroundPermissionsAsync();

          if (permission.granted) {
            const geocoded = await Location.geocodeAsync(query);

            if (!isMounted) {
              return;
            }

            setLocationOptions(await buildSearchLocationOptions(geocoded, query));
            return;
          }
        }

        const placemarks = await Location.reverseGeocodeAsync({
          latitude: node.latitude,
          longitude: node.longitude,
        });

        if (!isMounted) {
          return;
        }

        setLocationOptions(buildLocationOptions(placemarks, locationValue));
      } catch {
        if (!isMounted) {
          return;
        }

        setLocationOptions(buildLocationOptions([], locationValue));
      } finally {
        if (isMounted) {
          setIsLoadingLocations(false);
        }
      }
    }

    const timeoutId = setTimeout(() => {
      void loadLocationOptions();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [locationQuery, locationValue, node.latitude, node.longitude, visible]);

  const visibleLocationOptions = useMemo(() => {
    const query = locationQuery.trim().toLowerCase();

    return locationOptions.filter((option) => {
      if (!option.label.trim()) {
        return false;
      }

      if (!query) {
        return true;
      }

      return option.label.toLowerCase().includes(query);
    });
  }, [locationOptions, locationQuery]);
  const typedLocation = locationQuery.trim();

  const resolvedLocationOptions =
    currentAreaLabel && !visibleLocationOptions.some((option) => option.label === currentAreaLabel)
      ? [{ label: currentAreaLabel }, ...visibleLocationOptions]
      : visibleLocationOptions;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(20, 18, 30, 0.28)' }}>
        <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
        <View
          className="rounded-t-[32px] bg-white"
          style={{ maxHeight: '88%' }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: s(18), paddingBottom: s(26), gap: s(16) }}>
            <View className="items-center">
              <View
                style={{
                  width: s(48),
                  height: s(5),
                  borderRadius: s(999),
                  backgroundColor: colors.surface.avatarFill,
                }}
              />
            </View>

            <SectionHeading title={node.title} scale={scale} />

            <View>
              <Text
                className="font-semibold"
                style={{ marginBottom: s(8), fontSize: s(12), color: colors.text.muted }}>
                Search location
              </Text>
              <TextInput
                placeholder="Type a location"
                placeholderTextColor={colors.text.muted}
                style={{
                  minHeight: s(46),
                  borderRadius: s(16),
                  borderWidth: 1,
                  borderColor: needsLocation ? colors.brand.primary : colors.surface.cardBorder,
                  backgroundColor: colors.background.surface,
                  paddingHorizontal: s(14),
                  fontSize: s(14),
                  color: colors.text.primary,
                }}
                value={locationQuery}
                onChangeText={setLocationQuery}
              />
              {typedLocation && typedLocation !== locationValue ? (
                <View style={{ marginTop: s(10) }}>
                  <ActionButton
                    title={`Use "${typedLocation}"`}
                    tone="soft"
                    onPress={() => onChooseLocation({ value: typedLocation })}
                    scale={scale}
                  />
                </View>
              ) : null}
              {Mapbox && mapboxAccessToken ? (
                <View style={{ marginTop: s(10) }}>
                  <ActionButton
                    title="Open map"
                    tone="soft"
                    onPress={() => setIsMapPickerOpen(true)}
                    scale={scale}
                  />
                </View>
              ) : null}
              <View style={{ gap: s(8), marginTop: s(10) }}>
                {isLoadingLocations ? (
                  <View
                    className="rounded-[16px] bg-[#F6F4F8]"
                    style={{ paddingHorizontal: s(14), paddingVertical: s(12) }}>
                    <Text className="font-semibold" style={{ fontSize: s(12), color: colors.text.muted }}>
                      Loading locations...
                    </Text>
                  </View>
                ) : null}
                {resolvedLocationOptions.map((option) => {
                  const isSelected = option.label === locationValue;

                  return (
                    <Pressable
                      key={`${option.label}-${option.coordinate?.join(',') ?? 'manual'}`}
                      className="rounded-[16px]"
                      style={{
                        paddingHorizontal: s(14),
                        paddingVertical: s(12),
                        borderWidth: 1,
                        borderColor: isSelected || needsLocation
                          ? colors.brand.primary
                          : colors.surface.cardBorder,
                        backgroundColor: isSelected ? '#EEF9F7' : colors.background.surface,
                      }}
                      onPress={() => {
                        if (option.coordinate) {
                          setMapSelection({ coordinate: option.coordinate, label: option.label });
                        }

                        onChooseLocation({
                          latitude: option.coordinate?.[1],
                          longitude: option.coordinate?.[0],
                          value: option.label,
                        });
                      }}>
                      <Text
                        className="font-semibold"
                        style={{ fontSize: s(13), color: colors.text.primary }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text
                className="font-semibold"
                style={{ marginBottom: s(10), fontSize: s(12), color: colors.text.muted }}>
                Stop photos
              </Text>
              <View className="items-center">
                <PhotoGridEditor
                  items={nodeMediaItems}
                  selectedMediaId={selectedNodeMediaId ?? undefined}
                  width={editorWidth}
                  onSelectMedia={onSelectNodeMedia}
                  onReorder={(items) => onReorderNodeMedia(items.map((item) => item.id))}
                  scale={scale}
                />
              </View>
              {selectedNodeMediaId ? (
                <View style={{ marginTop: s(10) }}>
                  <ActionButton
                    title="Return selected photo"
                    tone="soft"
                    onPress={onReturnSelectedNodeMedia}
                    scale={scale}
                  />
                </View>
              ) : null}
            </View>

            <View>
              <Text
                className="font-semibold"
                style={{ marginBottom: s(10), fontSize: s(12), color: colors.text.muted }}>
                Unplaced photos
              </Text>
              {queueMediaItems.length ? (
                <>
                  <View className="items-center">
                    <PhotoGridEditor
                      items={queueMediaItems}
                      selectedMediaId={selectedQueueMediaId ?? undefined}
                      width={editorWidth}
                      onSelectMedia={onSelectQueueMedia}
                      onReorder={() => undefined}
                      scale={scale}
                    />
                  </View>
                  <View style={{ marginTop: s(10) }}>
                    <ActionButton
                      title="Add selected photo"
                      onPress={onAssignSelectedQueueMedia}
                      disabled={!selectedQueueMediaId}
                      scale={scale}
                    />
                  </View>
                </>
              ) : (
                <View
                  className="rounded-[18px] bg-[#F6F4F8]"
                  style={{ padding: s(14), borderWidth: 1, borderColor: colors.surface.cardBorder }}>
                  <Text className="font-semibold" style={{ fontSize: s(12), color: colors.text.muted }}>
                    No unplaced photos left.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <MapLocationPickerModal
        Mapbox={Mapbox}
        initialCoordinate={mapSelection.coordinate}
        initialLabel={mapSelection.label || typedLocation || locationValue}
        scale={scale}
        visible={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onConfirm={(selection) => {
          setMapSelection(selection);
          setLocationQuery(selection.label);
          onChooseLocation({
            latitude: selection.coordinate[1],
            longitude: selection.coordinate[0],
            value: selection.label,
          });
          setIsMapPickerOpen(false);
        }}
      />
    </Modal>
  );
}

function buildLocationOptions(
  placemarks: Location.LocationGeocodedAddress[],
  currentValue: string,
): LocationOption[] {
  const firstPlacemark = placemarks[0];
  const city = firstPlacemark?.city?.trim() || '';
  const district = firstPlacemark?.district?.trim() || '';
  const region = firstPlacemark?.region?.trim() || '';
  const country = firstPlacemark?.country?.trim() || '';

  return Array.from(
    new Set(
      [
        currentValue,
        [city, country].filter(Boolean).join(', '),
        [district, country].filter(Boolean).join(', '),
        [region, country].filter(Boolean).join(', '),
        country,
      ].filter(Boolean),
    ),
  ).map((label) => ({ label }));
}

function isCoordinateLike(value: string) {
  return /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(value.trim());
}

async function buildSearchLocationOptions(
  geocoded: Location.LocationGeocodedLocation[],
  query: string,
): Promise<LocationOption[]> {
  const options = await Promise.all(
    geocoded.slice(0, 5).map(async (result) => {
      try {
        const placemarks = await Location.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        });

        return {
          coordinate: [result.longitude, result.latitude] as [number, number],
          label: buildLocationOptions(placemarks, query)[0]?.label ?? query,
        };
      } catch {
        return {
          coordinate: [result.longitude, result.latitude] as [number, number],
          label: query,
        };
      }
    }),
  );

  const deduped = new Map<string, LocationOption>();

  for (const option of options) {
    deduped.set(`${option.label}-${option.coordinate?.join(',') ?? ''}`, option);
  }

  if (query.trim()) {
    deduped.set(`${query.trim()}-manual`, { label: query.trim() });
  }

  return [...deduped.values()];
}

function MapLocationPickerModal({
  Mapbox,
  initialCoordinate,
  initialLabel,
  scale,
  visible,
  onClose,
  onConfirm,
}: {
  Mapbox: ReturnType<typeof getMapboxModule>;
  initialCoordinate: [number, number];
  initialLabel: string;
  scale: number;
  visible: boolean;
  onClose: () => void;
  onConfirm: (selection: { coordinate: [number, number]; label: string }) => void;
}) {
  const s = (value: number) => value * scale;
  const [selection, setSelection] = useState({ coordinate: initialCoordinate, label: initialLabel });

  useEffect(() => {
    setSelection({ coordinate: initialCoordinate, label: initialLabel });
  }, [initialCoordinate, initialLabel, visible]);

  if (!visible) {
    return null;
  }

  if (!Mapbox || !mapboxAccessToken) {
    return (
      <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(20, 18, 30, 0.28)' }}>
          <View className="rounded-t-[32px] bg-white" style={{ padding: s(18), paddingBottom: s(26), gap: s(12) }}>
            <SectionHeading title="Pick on map" scale={scale} />
            <Text className="font-semibold" style={{ fontSize: s(12), color: colors.text.muted }}>
              Map picker needs the native Mapbox build.
            </Text>
            <ActionButton title="Close" tone="soft" onPress={onClose} scale={scale} />
          </View>
        </View>
      </Modal>
    );
  }

  const { Camera, MapView, MarkerView, StyleURL } = Mapbox;

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(20, 18, 30, 0.28)' }}>
        <View className="rounded-t-[32px] bg-white" style={{ padding: s(18), paddingBottom: s(26), gap: s(12) }}>
          <SectionHeading title="Pick on map" scale={scale} />
          <View style={{ height: s(320), overflow: 'hidden', borderRadius: s(20) }}>
            <MapView
              style={{ flex: 1 }}
              styleURL={StyleURL.SatelliteStreet}
              onPress={async (feature: any) => {
                const coordinates = feature?.geometry?.coordinates;

                if (!Array.isArray(coordinates) || coordinates.length < 2) {
                  return;
                }

                const nextCoordinate: [number, number] = [coordinates[0], coordinates[1]];

                try {
                  const placemarks = await Location.reverseGeocodeAsync({
                    latitude: nextCoordinate[1],
                    longitude: nextCoordinate[0],
                  });
                  const label = buildLocationOptions(placemarks, selection.label)[0]?.label ?? selection.label;
                  setSelection({ coordinate: nextCoordinate, label });
                } catch {
                  setSelection({ coordinate: nextCoordinate, label: selection.label });
                }
              }}>
              <Camera zoomLevel={11} centerCoordinate={selection.coordinate} />
              <MarkerView coordinate={selection.coordinate} anchor={{ x: 0.5, y: 0.5 }}>
                <View
                  style={{
                    width: s(18),
                    height: s(18),
                    borderRadius: s(999),
                    backgroundColor: colors.brand.secondary,
                    borderWidth: 2,
                    borderColor: colors.background.surface,
                  }}
                />
              </MarkerView>
            </MapView>
          </View>
          <Text className="font-semibold" style={{ fontSize: s(12), color: colors.text.muted }}>
            {selection.label}
          </Text>
          <View style={{ gap: s(10) }}>
            <ActionButton title="Use this spot" onPress={() => onConfirm(selection)} scale={scale} />
            <ActionButton title="Cancel" tone="soft" onPress={onClose} scale={scale} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function mapImportedMediaToGridItem(media: ImportedTripMediaDraft): TripMedia {
  return {
    hasGps: media.hasGps,
    id: getImportedMediaId(media),
    placementStatus: media.placementStatus,
    takenAt: media.takenAt,
    type: media.type,
    uri: media.remoteUrl,
  };
}

export function getImportedMediaId(media: ImportedTripMediaDraft) {
  return `${media.selectionIndex}:${media.sourceAssetId ?? media.remoteUrl}`;
}
