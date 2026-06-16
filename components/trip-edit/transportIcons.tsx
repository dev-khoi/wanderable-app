import { Bike, CarFront, Check, Footprints, Minus, Pencil, Plane } from 'lucide-react-native';

import { type LucideIcon } from 'lucide-react-native';

import { type TransportMode } from '@/lib/trips/types';

type TransportIconConfig = {
  icon: LucideIcon;
  label: string;
};

export const transportIconMap: Record<TransportMode, TransportIconConfig> = {
  bike: { icon: Bike, label: 'Bike' },
  car: { icon: CarFront, label: 'Car' },
  fly: { icon: Plane, label: 'Fly' },
  none: { icon: Minus, label: 'None' },
  walk: { icon: Footprints, label: 'Walk' },
};

export function EditorIcon({
  color,
  icon: Icon,
  size,
}: {
  color: string;
  icon: LucideIcon;
  size: number;
}) {
  return <Icon color={color} size={size} strokeWidth={2.1} />;
}

export function TransportModeIcon({
  mode,
  color,
  size,
}: {
  mode: TransportMode;
  color: string;
  size: number;
}) {
  const icon = transportIconMap[mode];

  return <EditorIcon color={color} icon={icon.icon} size={size} />;
}

export const editorIcons = {
  check: Check,
  pencil: Pencil,
};
