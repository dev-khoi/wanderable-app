import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { WanderableMark } from '@/components/wanderable';
import { wanderableTheme } from '@/constants/wanderableTheme';
import { type TripMedia as MediaItem, type TransportMode } from '@/lib/trips/types';
import { ChevronLeft, GripVertical } from 'lucide-react-native';

import { EditorIcon, TransportModeIcon, editorIcons, transportIconMap } from './transportIcons';

const { colors } = wanderableTheme;
const PHOTO_GRID_SPRING = {
  damping: 18,
  stiffness: 220,
  mass: 0.22,
};

type ScaledProps = {
  scale: number;
};

type EditHeaderProps = ScaledProps & {
  title: string;
  top: number;
  onBack: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  floating?: boolean;
};

export function EditHeader({ title, top, onBack, rightLabel, onRightPress, scale, floating = true }: EditHeaderProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className={`left-0 right-0 z-20 flex-row items-center justify-between ${floating ? 'absolute' : ''}`}
      style={{
        top: floating ? top : undefined,
        marginTop: floating ? undefined : top,
        paddingHorizontal: s(18),
        height: s(44),
      }}>
      <Pressable accessibilityRole="button" hitSlop={12} onPress={onBack}>
        <ChevronLeft color={colors.text.primary} size={s(22)} strokeWidth={2.5} />
      </Pressable>
      <Text className="font-extrabold" style={{ fontSize: s(18), color: colors.text.primary }}>
        {title}
      </Text>
      {rightLabel && onRightPress ? (
        <Pressable accessibilityRole="button" hitSlop={12} onPress={onRightPress}>
          <Text className="font-extrabold" style={{ fontSize: s(14), color: colors.brand.primary }}>
            {rightLabel}
          </Text>
        </Pressable>
      ) : (
        <View style={{ width: s(36) }} />
      )}
    </View>
  );
}

type SheetProps = {
  children: ReactNode;
  style?: object;
};

export function EditSheet({ children, style }: SheetProps) {
  return (
    <View
      className="overflow-hidden rounded-t-[32px] bg-white"
      style={style}>
      {children}
    </View>
  );
}

type TitleCardProps = ScaledProps & {
  value: string;
  onChangeText: (value: string) => void;
  onEndEditing?: () => void;
};

export function EditableTitleCard({ value, onChangeText, onEndEditing, scale }: TitleCardProps) {
  const s = (valueToScale: number) => valueToScale * scale;

  return (
    <View
      className="flex-row items-center rounded-[22px] bg-white"
      style={{
        paddingHorizontal: s(16),
        paddingVertical: s(14),
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.surface.cardBorder,
      }}>
      <EditorIcon color={colors.icon.default} icon={editorIcons.pencil} size={s(18)} />
      <TextInput
        className="ml-3 flex-1 font-extrabold"
        placeholder="Untitled trip"
        placeholderTextColor={colors.text.muted}
        style={{ fontSize: s(24), color: colors.text.primary, paddingVertical: 0 }}
        value={value}
        onEndEditing={onEndEditing}
        onChangeText={onChangeText}
      />
    </View>
  );
}

type MetaPillProps = ScaledProps & {
  label: string;
  value: string;
};

export function MetaPill({ label, value, scale }: MetaPillProps) {
  const s = (valueToScale: number) => valueToScale * scale;

  return (
    <View
      className="rounded-full"
      style={{ paddingHorizontal: s(14), paddingVertical: s(10), backgroundColor: '#F6F4F8' }}>
      <Text className="font-semibold" style={{ fontSize: s(10), color: colors.text.muted }}>
        {label}
      </Text>
      <Text className="mt-1 font-extrabold" style={{ fontSize: s(12), color: colors.text.primary }}>
        {value}
      </Text>
    </View>
  );
}

type SectionHeadingProps = ScaledProps & {
  title: string;
  body?: string;
};

export function SectionHeading({ title, body, scale }: SectionHeadingProps) {
  const s = (value: number) => value * scale;

  return (
    <View>
      <Text className="font-extrabold" style={{ fontSize: s(18), color: colors.text.primary }}>
        {title}
      </Text>
      {body ? (
        <Text className="mt-1 font-semibold" style={{ fontSize: s(12), lineHeight: s(18), color: colors.text.muted }}>
          {body}
        </Text>
      ) : null}
    </View>
  );
}

type ActionButtonProps = ScaledProps & {
  title: string;
  tone?: 'primary' | 'soft' | 'ghost';
  onPress: () => void;
  disabled?: boolean;
};

export function ActionButton({ title, tone = 'primary', onPress, disabled, scale }: ActionButtonProps) {
  const s = (value: number) => value * scale;
  const backgroundColor =
    tone === 'primary'
      ? colors.brand.primary
      : tone === 'soft'
        ? '#EEF9F7'
        : colors.text.primary;
  const textColor = tone === 'soft' ? colors.brand.primary : colors.text.inverse;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className="items-center justify-center rounded-[14px]"
      style={{
        minHeight: s(42),
        paddingHorizontal: s(14),
        backgroundColor,
        opacity: disabled ? 0.45 : 1,
      }}
      onPress={onPress}>
      <Text className="font-extrabold" style={{ fontSize: s(12), color: textColor }}>
        {title}
      </Text>
    </Pressable>
  );
}

type HighlightCardProps = ScaledProps & {
  coverUri?: string | null;
  dateLabel?: string;
  locationName: string;
  timeRange: string;
  title: string;
  onPress?: () => void;
};

export function HighlightCard({
  coverUri,
  dateLabel,
  locationName,
  timeRange,
  title,
  onPress,
  scale,
}: HighlightCardProps) {
  const s = (value: number) => value * scale;

  return (
    <View>
      {dateLabel ? (
        <Text className="mb-2 font-semibold" style={{ fontSize: s(12), color: colors.text.primary }}>
          {dateLabel}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        className="rounded-[24px] bg-white"
        style={{
          padding: s(12),
          borderWidth: 1,
          borderColor: colors.surface.cardBorder,
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.04,
          shadowOffset: { width: 0, height: s(8) },
          shadowRadius: s(18),
          elevation: 2,
        }}
        onPress={onPress}>
        <View className="flex-row items-start" style={{ gap: s(12) }}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              resizeMode="cover"
              className="rounded-[18px]"
              style={{ width: s(76), height: s(76), backgroundColor: colors.surface.muted }}
            />
          ) : (
            <View
              className="rounded-[18px]"
              style={{ width: s(76), height: s(76), backgroundColor: colors.surface.muted }}
            />
          )}

          <View className="flex-1">
            <Text className="font-extrabold" style={{ fontSize: s(17), color: colors.text.primary }}>
              {title}
            </Text>
            <View className="mt-2 flex-row items-center">
              <WanderableMark size={s(12)} style={{ marginRight: s(6) }} />
              <Text className="font-semibold" style={{ fontSize: s(12), color: colors.text.muted }}>
                {locationName}
              </Text>
            </View>
            <Text className="mt-2 font-semibold" style={{ fontSize: s(11), color: colors.text.muted }}>
              {timeRange}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

type RouteConnectorProps = ScaledProps & {
  transport: TransportMode;
  onChangeTransport?: (transport: TransportMode) => void;
};

const TRANSPORT_OPTIONS = Object.entries(transportIconMap) as [TransportMode, (typeof transportIconMap)[TransportMode]][];

export function RouteConnector({ transport, onChangeTransport, scale }: RouteConnectorProps) {
  const s = (value: number) => value * scale;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => {
    if (onChangeTransport) {
      setIsMenuOpen(true);
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" className="items-center py-2" hitSlop={10} onPress={openMenu}>
        <View className="items-center justify-center" style={{ width: s(44), height: s(44) }}>
          <View style={{ position: 'absolute', width: s(2), height: s(44), backgroundColor: '#D8D2DE' }} />
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: s(30),
              height: s(30),
              backgroundColor: colors.background.surface,
              borderWidth: 1,
              borderColor: colors.surface.cardBorder,
            }}>
            {transport === 'none' ? null : (
              <TransportModeIcon mode={transport} color={colors.icon.default} size={s(17)} />
            )}
          </View>
        </View>
      </Pressable>

      <Modal animationType="fade" transparent visible={isMenuOpen} onRequestClose={closeMenu}>
        <View
          className="flex-1 justify-center"
          style={{ paddingHorizontal: s(24), backgroundColor: 'rgba(28, 18, 67, 0.24)' }}>
          <Pressable
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            onPress={closeMenu}
          />
          <View
            className="rounded-[24px] bg-white"
            style={{ padding: s(16), borderWidth: 1, borderColor: colors.surface.cardBorder }}>
            <Text className="font-extrabold" style={{ fontSize: s(16), color: colors.text.primary }}>
              Choose transport
            </Text>
            <View style={{ marginTop: s(12), gap: s(8) }}>
              {TRANSPORT_OPTIONS.map(([mode, option]) => {
                const isSelected = mode === transport;

                return (
                  <Pressable
                    key={mode}
                    className="flex-row items-center justify-between rounded-[18px]"
                    style={{
                      paddingHorizontal: s(14),
                      paddingVertical: s(12),
                      borderWidth: 1,
                      borderColor: isSelected ? colors.brand.primary : colors.surface.cardBorder,
                      backgroundColor: isSelected ? '#EEF9F7' : colors.background.surface,
                    }}
                    onPress={() => {
                      onChangeTransport?.(mode);
                      closeMenu();
                    }}>
                    <View className="flex-row items-center">
                      <TransportModeIcon mode={mode} color={colors.icon.default} size={s(18)} />
                      <Text className="ml-3 font-semibold" style={{ fontSize: s(13), color: colors.text.primary }}>
                        {option.label}
                      </Text>
                    </View>
                    {isSelected ? (
                      <EditorIcon color={colors.brand.primary} icon={editorIcons.check} size={s(18)} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

type PhotoGridEditorProps = ScaledProps & {
  items: MediaItem[];
  selectedMediaId?: string;
  width: number;
  onSelectMedia?: (mediaId: string) => void;
  onReorder: (items: MediaItem[]) => void;
};

export function PhotoGridEditor({
  items,
  selectedMediaId,
  width,
  onSelectMedia,
  onReorder,
  scale,
}: PhotoGridEditorProps) {
  const s = (value: number) => value * scale;
  const gap = s(12);
  const columns = 2;
  const cellWidth = (width - gap) / columns;
  const cellHeight = cellWidth + s(62);
  const [renderItems, setRenderItems] = useState(items);
  const itemLookupRef = useRef<Record<string, MediaItem>>({});
  const isDraggingRef = useRef(false);
  const positions = useSharedValue(buildPhotoGridPositions(items));
  const activeId = useSharedValue<string | null>(null);
  const activeX = useSharedValue(0);
  const activeY = useSharedValue(0);
  const activeOriginX = useSharedValue(0);
  const activeOriginY = useSharedValue(0);

  useEffect(() => {
    itemLookupRef.current = Object.fromEntries(items.map((item) => [item.id, item]));

    if (!isDraggingRef.current) {
      setRenderItems(items);
      positions.value = buildPhotoGridPositions(items);
    }
  }, [items, positions]);

  const rowCount = Math.max(1, Math.ceil(renderItems.length / columns));
  const containerHeight = rowCount * cellHeight + Math.max(rowCount - 1, 0) * gap;

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDropComplete = (orderedIds: string[]) => {
    isDraggingRef.current = false;
    activeId.value = null;

    const nextItems = orderedIds
      .map((id) => itemLookupRef.current[id])
      .filter((item): item is MediaItem => !!item);

    setRenderItems(nextItems);
    onReorder(nextItems);
  };

  return (
    <View style={{ width, height: containerHeight }}>
      {renderItems.map((item) => {
        return (
          <MediaGridCell
            key={item.id}
            cellHeight={cellHeight}
            cellWidth={cellWidth}
            columns={columns}
            gap={gap}
            item={item}
            itemCount={renderItems.length}
            isSelected={item.id === selectedMediaId}
            activeId={activeId}
            activeOriginX={activeOriginX}
            activeOriginY={activeOriginY}
            activeX={activeX}
            activeY={activeY}
            positions={positions}
            scale={scale}
            onBeginDrag={handleDragStart}
            onDropComplete={handleDropComplete}
            onSelect={onSelectMedia ? () => onSelectMedia(item.id) : undefined}
          />
        );
      })}
    </View>
  );
}

type MediaGridCellProps = ScaledProps & {
  cellHeight: number;
  cellWidth: number;
  columns: number;
  gap: number;
  itemCount: number;
  isSelected: boolean;
  item: MediaItem;
  positions: SharedValue<Record<string, number>>;
  activeId: SharedValue<string | null>;
  activeX: SharedValue<number>;
  activeY: SharedValue<number>;
  activeOriginX: SharedValue<number>;
  activeOriginY: SharedValue<number>;
  onBeginDrag: () => void;
  onDropComplete: (orderedIds: string[]) => void;
  onSelect?: () => void;
};

function MediaGridCell({
  cellHeight,
  cellWidth,
  columns,
  gap,
  itemCount,
  isSelected,
  item,
  positions,
  activeId,
  activeX,
  activeY,
  activeOriginX,
  activeOriginY,
  scale,
  onBeginDrag,
  onDropComplete,
  onSelect,
}: MediaGridCellProps) {
  const s = (value: number) => value * scale;
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activateAfterLongPress(120)
        .onBegin(() => {
          const startIndex = positions.value[item.id] ?? 0;
          const slot = getPhotoGridSlot(startIndex, columns, cellWidth, cellHeight, gap);
          activeId.value = item.id;
          activeOriginX.value = slot.x;
          activeOriginY.value = slot.y;
          activeX.value = slot.x;
          activeY.value = slot.y;
          runOnJS(onBeginDrag)();
        })
        .onUpdate((event) => {
          const nextX = activeOriginX.value + event.translationX;
          const nextY = activeOriginY.value + event.translationY;

          activeX.value = nextX;
          activeY.value = nextY;

          const currentIndex = positions.value[item.id] ?? 0;
          const targetIndex = getPhotoGridTargetIndex({
            centerX: nextX + cellWidth / 2,
            centerY: nextY + cellHeight / 2,
            cellHeight,
            cellWidth,
            columns,
            gap,
            itemCount,
          });

          if (targetIndex !== currentIndex) {
            positions.value = movePhotoGridPosition(positions.value, currentIndex, targetIndex);
          }
        })
        .onFinalize(() => {
          const targetIndex = positions.value[item.id] ?? 0;
          const target = getPhotoGridSlot(targetIndex, columns, cellWidth, cellHeight, gap);

          activeX.value = withSpring(target.x, PHOTO_GRID_SPRING);
          activeY.value = withSpring(target.y, PHOTO_GRID_SPRING, (finished) => {
            if (finished) {
              runOnJS(onDropComplete)(getPhotoGridOrderedIds(positions.value));
            }
          });
        }),
    [
      activeId,
      activeOriginX,
      activeOriginY,
      activeX,
      activeY,
      cellHeight,
      cellWidth,
      columns,
      gap,
      item.id,
      itemCount,
      onBeginDrag,
      onDropComplete,
      positions,
    ],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const slot = getPhotoGridSlot(
      positions.value[item.id] ?? 0,
      columns,
      cellWidth,
      cellHeight,
      gap,
    );
    const isDragging = activeId.value === item.id;

    return {
      position: 'absolute',
      width: cellWidth,
      height: cellHeight,
      zIndex: isDragging ? 20 : 1,
      transform: [
        {
          translateX: isDragging ? activeX.value : withSpring(slot.x, PHOTO_GRID_SPRING),
        },
        {
          translateY: isDragging ? activeY.value : withSpring(slot.y, PHOTO_GRID_SPRING),
        },
        {
          scale: withSpring(isDragging ? 1.02 : 1, PHOTO_GRID_SPRING),
        },
      ],
    };
  }, [activeId, activeX, activeY, cellHeight, cellWidth, columns, gap, item.id, positions]);

  return (
    <Animated.View style={animatedStyle}>
      <View
        className="overflow-hidden rounded-[22px] bg-white"
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: isSelected ? colors.brand.primary : colors.surface.cardBorder,
          shadowColor: colors.shadow.default,
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: s(8) },
          shadowRadius: s(18),
          elevation: 3,
        }}>
        <Pressable accessibilityRole="button" style={{ flex: 1 }} onPress={onSelect}>
          {item.uri ? (
            <Image
              source={{ uri: item.uri }}
              resizeMode="cover"
              style={{ width: '100%', height: cellWidth, backgroundColor: colors.surface.muted }}
            />
          ) : (
            <View style={{ width: '100%', height: cellWidth, backgroundColor: colors.surface.muted }} />
          )}
          <View style={{ paddingHorizontal: s(10), paddingVertical: s(9) }}>
            <View className="flex-row items-center justify-between">
              <Text className="font-extrabold" style={{ fontSize: s(11), color: colors.text.primary }}>
                {formatPhotoLabel(item)}
              </Text>
              <GestureDetector gesture={gesture}>
                <Animated.View
                  className="rounded-full"
                  style={{
                    width: s(28),
                    height: s(28),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#F6F4F8',
                  }}>
                  <GripVertical size={s(14)} color={colors.text.muted} strokeWidth={2.25} />
                </Animated.View>
              </GestureDetector>
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function formatPhotoLabel(media: MediaItem) {
  if (!media.takenAt) {
    return media.type === 'video' ? 'Video' : 'Photo';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(media.takenAt));
}

function buildPhotoGridPositions(items: MediaItem[]) {
  return Object.fromEntries(items.map((item, index) => [item.id, index]));
}

function getPhotoGridOrderedIds(positions: Record<string, number>) {
  'worklet';

  return Object.entries(positions)
    .sort((left, right) => left[1] - right[1])
    .map(([id]) => id);
}

function movePhotoGridPosition(
  positions: Record<string, number>,
  fromIndex: number,
  toIndex: number,
) {
  'worklet';

  if (fromIndex === toIndex) {
    return positions;
  }

  const nextPositions: Record<string, number> = {};

  for (const [id, index] of Object.entries(positions)) {
    if (index === fromIndex) {
      nextPositions[id] = toIndex;
    } else if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
      nextPositions[id] = index - 1;
    } else if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
      nextPositions[id] = index + 1;
    } else {
      nextPositions[id] = index;
    }
  }

  return nextPositions;
}

function getPhotoGridSlot(
  index: number,
  columns: number,
  cellWidth: number,
  cellHeight: number,
  gap: number,
) {
  'worklet';

  return {
    x: (index % columns) * (cellWidth + gap),
    y: Math.floor(index / columns) * (cellHeight + gap),
  };
}

function getPhotoGridTargetIndex({
  centerX,
  centerY,
  cellHeight,
  cellWidth,
  columns,
  gap,
  itemCount,
}: {
  centerX: number;
  centerY: number;
  cellHeight: number;
  cellWidth: number;
  columns: number;
  gap: number;
  itemCount: number;
}) {
  'worklet';

  const nextColumn = Math.max(
    0,
    Math.min(columns - 1, Math.round(centerX / (cellWidth + gap))),
  );
  const nextRow = Math.max(0, Math.round(centerY / (cellHeight + gap)));

  return Math.max(0, Math.min(itemCount - 1, nextRow * columns + nextColumn));
}
