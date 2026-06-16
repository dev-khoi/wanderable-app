import { Text, View } from 'react-native';

import { HighlightCard, SectionHeading } from '@/components/trip-edit';
import type { ImportedTripDraft, ImportedTripNodeDraft } from '@/lib/trips/import';

import { ImportStopEditor } from './ImportStopEditor';

type PreviewEntry = {
  day: ImportedTripDraft['days'][number];
  node: ImportedTripNodeDraft;
};

type TripImportPreviewProps = {
  activeStop: PreviewEntry | null;
  draft: ImportedTripDraft;
  editorWidth: number;
  formatImportedDay: (dayDate: string) => string;
  previewNodes: PreviewEntry[];
  scale: number;
  selectedNodeMediaId: string | null;
  selectedQueueMediaId: string | null;
  stopNeedsLocation: (node: ImportedTripNodeDraft) => boolean;
  unresolvedLocationCount: number;
  onAssignSelectedQueueMedia: () => void;
  onChooseLocation: (selection: { latitude?: number; longitude?: number; value: string }) => void;
  onCloseEditor: () => void;
  onOpenStop: (node: ImportedTripNodeDraft) => void;
  onReorderNodeMedia: (mediaIdsInOrder: string[]) => void;
  onReturnSelectedNodeMedia: () => void;
  onSelectNodeMedia: (mediaId: string) => void;
  onSelectQueueMedia: (mediaId: string) => void;
};

export function TripImportPreview({
  activeStop,
  draft,
  editorWidth,
  formatImportedDay,
  previewNodes,
  scale,
  selectedNodeMediaId,
  selectedQueueMediaId,
  stopNeedsLocation,
  unresolvedLocationCount,
  onAssignSelectedQueueMedia,
  onChooseLocation,
  onCloseEditor,
  onOpenStop,
  onReorderNodeMedia,
  onReturnSelectedNodeMedia,
  onSelectNodeMedia,
  onSelectQueueMedia,
}: TripImportPreviewProps) {
  const s = (value: number) => value * scale;

  return (
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
            key={`${node.daySortOrder}:${node.sortOrder}`}
            coverUri={node.media[0]?.remoteUrl ?? null}
            dateLabel={day.dayDate ? `${day.label} - ${formatImportedDay(day.dayDate)}` : `${day.label} - Date TBD`}
            locationName={node.locationName || 'Add location'}
            timeRange={`${node.media.length} imported photo${node.media.length === 1 ? '' : 's'}`}
            title={node.title}
            scale={scale}
            onPress={() => onOpenStop(node)}
          />
        ))
      ) : (
        <View className="rounded-[24px] bg-[#F6F4F8]" style={{ padding: s(18) }}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: '#15131A' }}>
            No mapped highlights yet.
          </Text>
          <Text
            className="mt-2 font-semibold"
            style={{ fontSize: s(12), lineHeight: s(18), color: '#6C6672' }}>
            Pick photos with location metadata enabled so Wanderable can place them on the map.
          </Text>
        </View>
      )}

      {activeStop ? (
        <ImportStopEditor
          editorWidth={editorWidth}
          locationValue={activeStop.node.locationName}
          missingMedia={draft.missingGpsMedia}
          needsLocation={stopNeedsLocation(activeStop.node)}
          node={activeStop.node}
          scale={scale}
          selectedNodeMediaId={selectedNodeMediaId}
          selectedQueueMediaId={selectedQueueMediaId}
          visible
          onAssignSelectedQueueMedia={onAssignSelectedQueueMedia}
          onChooseLocation={onChooseLocation}
          onClose={onCloseEditor}
          onReorderNodeMedia={onReorderNodeMedia}
          onReturnSelectedNodeMedia={onReturnSelectedNodeMedia}
          onSelectNodeMedia={onSelectNodeMedia}
          onSelectQueueMedia={onSelectQueueMedia}
        />
      ) : null}

      {draft.missingLocationCount > 0 || unresolvedLocationCount > 0 ? (
        <View className="rounded-[24px] bg-[#F6F4F8]" style={{ padding: s(18) }}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: '#15131A' }}>
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
  );
}
