import { ActivityIndicator, Text, View } from 'react-native';

import { ActionButton, MetaPill, SectionHeading } from '@/components/trip-edit';
import { wanderableTheme } from '@/constants/wanderableTheme';

const { colors } = wanderableTheme;

type TripImportActionsProps = {
  canCreateTrip: boolean;
  isAnalyzingPhotos: boolean;
  isBusy: boolean;
  isCreatingTrip: boolean;
  isPickingPhotos: boolean;
  mappedPhotoCount: number;
  scale: number;
  stopCount: number;
  totalPhotoCount: number;
  unplacedPhotoCount: number;
  onAddPhotos: () => void;
  onCreateTrip: () => void;
};

export function TripImportActions({
  canCreateTrip,
  isAnalyzingPhotos,
  isBusy,
  isCreatingTrip,
  isPickingPhotos,
  mappedPhotoCount,
  scale,
  stopCount,
  totalPhotoCount,
  unplacedPhotoCount,
  onAddPhotos,
  onCreateTrip,
}: TripImportActionsProps) {
  const s = (value: number) => value * scale;

  return (
    <>
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
          onPress={onAddPhotos}
          disabled={isBusy}
          scale={scale}
        />
        <ActionButton
          title={isCreatingTrip ? 'Creating trip...' : 'Create trip'}
          tone="soft"
          onPress={onCreateTrip}
          disabled={!canCreateTrip}
          scale={scale}
        />
      </View>

      <View className="mt-4 flex-row flex-wrap" style={{ gap: s(10) }}>
        <MetaPill label="Photos" value={String(totalPhotoCount)} scale={scale} />
        <MetaPill label="Mapped" value={String(mappedPhotoCount)} scale={scale} />
        <MetaPill label="Stops" value={String(stopCount)} scale={scale} />
        <MetaPill label="Unplaced" value={String(unplacedPhotoCount)} scale={scale} />
      </View>

      {isAnalyzingPhotos ? (
        <View className="mt-4 items-center rounded-[24px] bg-[#F6F4F8]" style={{ padding: s(20) }}>
          <ActivityIndicator color={colors.brand.primary} />
          <Text className="mt-3 font-extrabold" style={{ fontSize: s(16), color: colors.text.primary }}>
            Rebuilding your itinerary
          </Text>
          <Text
            className="mt-2 text-center font-semibold"
            style={{ fontSize: s(12), lineHeight: s(18), color: colors.text.muted }}>
            Grouping photos into days and mapped highlights from the metadata.
          </Text>
        </View>
      ) : null}
    </>
  );
}
