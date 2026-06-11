import { useSyncExternalStore } from 'react';

export type TransportMode = 'car' | 'bike' | 'walk' | 'fly' | 'none';

export type MediaItem = {
  id: string;
  type: 'photo' | 'video';
  uri: string;
  takenAt: string;
  description: string;
  hasGps: boolean;
};

export type TripNode = {
  id: string;
  dayId: string;
  title: string;
  locationName: string;
  country: string;
  timeRange: string;
  coordinate: [number, number];
  mapPoint: {
    x: number;
    y: number;
  };
  photoCount: number;
  blog: string;
  voiceNoteSeconds?: number;
  media: MediaItem[];
};

export type TripDay = {
  id: string;
  label: string;
  date: string;
  dominantLocation: string;
  coverMediaId: string;
};

export type RouteSegment = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  transport: TransportMode;
};

export type Trip = {
  id: string;
  ownerName: string;
  title: string;
  subtitle: string;
  dateRange: string;
  durationLabel: string;
  distanceLabel: string;
  countriesLabel: string;
  coverUri: string;
  zoomStops: string[];
  days: TripDay[];
  nodes: TripNode[];
  routeSegments: RouteSegment[];
  missingGpsMedia: MediaItem[];
};

const kyotoGate = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
const bamboo = 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1200&q=80';
const tokyoNight = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80';
const osakaFood = 'https://images.unsplash.com/photo-1569783721854-33a99b4c8b82?auto=format&fit=crop&w=1200&q=80';
const naraDeer = 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?auto=format&fit=crop&w=1200&q=80';
const trainWindow = 'https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=1200&q=80';

export const mockTrip: Trip = {
  id: 'japan-spring-2026',
  ownerName: 'Jihan Audy',
  title: 'Japan Spring Route',
  subtitle: 'Tokyo, Kyoto, Nara, Osaka',
  dateRange: 'Mar 18 - Mar 25, 2026',
  durationLabel: '8 days',
  distanceLabel: '642 km',
  countriesLabel: '1 country',
  coverUri: kyotoGate,
  zoomStops: ['Globe', 'Japan', 'Kyoto'],
  days: [
    {
      id: 'day-1',
      label: 'Day 1',
      date: 'Mar 18',
      dominantLocation: 'Tokyo',
      coverMediaId: 'media-shibuya-1',
    },
    {
      id: 'day-2',
      label: 'Day 2',
      date: 'Mar 19',
      dominantLocation: 'Kyoto',
      coverMediaId: 'media-fushimi-1',
    },
    {
      id: 'day-3',
      label: 'Day 3',
      date: 'Mar 20',
      dominantLocation: 'Nara / Osaka',
      coverMediaId: 'media-nara-1',
    },
  ],
  nodes: [
    {
      id: 'node-shibuya',
      dayId: 'day-1',
      title: 'First night in Shibuya',
      locationName: 'Shibuya Crossing',
      country: 'Japan',
      timeRange: '7:10 PM - 9:20 PM',
      coordinate: [139.7006, 35.6595],
      mapPoint: { x: 18, y: 58 },
      photoCount: 4,
      blog: 'We landed tired, dropped our bags, and walked straight into the lights. It felt like the trip officially started here.',
      voiceNoteSeconds: 28,
      media: [
        {
          id: 'media-shibuya-1',
          type: 'photo',
          uri: tokyoNight,
          takenAt: '2026-03-18T19:12:00.000Z',
          description: 'The crossing right after dinner, when the city felt unreal.',
          hasGps: true,
        },
        {
          id: 'media-shibuya-2',
          type: 'photo',
          uri: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
          takenAt: '2026-03-18T20:08:00.000Z',
          description: 'Neon alleys and vending machines everywhere.',
          hasGps: true,
        },
      ],
    },
    {
      id: 'node-train',
      dayId: 'day-2',
      title: 'Bullet train morning',
      locationName: 'Tokaido Shinkansen',
      country: 'Japan',
      timeRange: '8:00 AM - 10:15 AM',
      coordinate: [138.5, 35.3],
      mapPoint: { x: 38, y: 49 },
      photoCount: 3,
      blog: 'Coffee, window seats, and the feeling that the whole country was sliding by quietly.',
      media: [
        {
          id: 'media-train-1',
          type: 'photo',
          uri: trainWindow,
          takenAt: '2026-03-19T08:22:00.000Z',
          description: 'View from the train before Kyoto.',
          hasGps: true,
        },
      ],
    },
    {
      id: 'node-fushimi',
      dayId: 'day-2',
      title: 'Fushimi Inari before sunset',
      locationName: 'Fushimi Inari Taisha',
      country: 'Japan',
      timeRange: '4:10 PM - 5:35 PM',
      coordinate: [135.7727, 34.9671],
      mapPoint: { x: 55, y: 44 },
      photoCount: 9,
      blog: 'We kept saying we would turn back after the next gate, then kept walking anyway. The rain made the orange gates look deeper.',
      voiceNoteSeconds: 36,
      media: [
        {
          id: 'media-fushimi-1',
          type: 'photo',
          uri: kyotoGate,
          takenAt: '2026-03-19T16:11:00.000Z',
          description: 'First view of the torii gates.',
          hasGps: true,
        },
        {
          id: 'media-fushimi-2',
          type: 'photo',
          uri: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
          takenAt: '2026-03-19T16:47:00.000Z',
          description: 'A quieter path after the crowds thinned out.',
          hasGps: true,
        },
      ],
    },
    {
      id: 'node-arashiyama',
      dayId: 'day-2',
      title: 'Bamboo walk',
      locationName: 'Arashiyama Bamboo Grove',
      country: 'Japan',
      timeRange: '10:00 AM - 11:45 AM',
      coordinate: [135.6668, 35.017],
      mapPoint: { x: 73, y: 34 },
      photoCount: 6,
      blog: 'The path was crowded, but there were little pockets where everything went quiet and green.',
      media: [
        {
          id: 'media-bamboo-1',
          type: 'photo',
          uri: bamboo,
          takenAt: '2026-03-20T10:04:00.000Z',
          description: 'Morning light through the bamboo.',
          hasGps: true,
        },
      ],
    },
    {
      id: 'node-nara',
      dayId: 'day-3',
      title: 'Deer park chaos',
      locationName: 'Nara Park',
      country: 'Japan',
      timeRange: '1:15 PM - 3:00 PM',
      coordinate: [135.8398, 34.6851],
      mapPoint: { x: 64, y: 64 },
      photoCount: 7,
      blog: 'The deer were polite until the crackers came out. This was the funniest stop of the trip.',
      voiceNoteSeconds: 19,
      media: [
        {
          id: 'media-nara-1',
          type: 'photo',
          uri: naraDeer,
          takenAt: '2026-03-20T13:21:00.000Z',
          description: 'The one deer that bowed before stealing the whole stack.',
          hasGps: true,
        },
      ],
    },
    {
      id: 'node-osaka',
      dayId: 'day-3',
      title: 'Late food in Dotonbori',
      locationName: 'Dotonbori',
      country: 'Japan',
      timeRange: '8:30 PM - 11:10 PM',
      coordinate: [135.5019, 34.6687],
      mapPoint: { x: 83, y: 74 },
      photoCount: 8,
      blog: 'We were too full and still kept ordering. The best night for food, noise, and walking with no plan.',
      media: [
        {
          id: 'media-osaka-1',
          type: 'photo',
          uri: osakaFood,
          takenAt: '2026-03-20T20:42:00.000Z',
          description: 'Takoyaki stand before the river walk.',
          hasGps: true,
        },
      ],
    },
  ],
  routeSegments: [
    { id: 'segment-1', fromNodeId: 'node-shibuya', toNodeId: 'node-train', transport: 'fly' },
    { id: 'segment-2', fromNodeId: 'node-train', toNodeId: 'node-fushimi', transport: 'car' },
    { id: 'segment-3', fromNodeId: 'node-fushimi', toNodeId: 'node-arashiyama', transport: 'walk' },
    { id: 'segment-4', fromNodeId: 'node-arashiyama', toNodeId: 'node-nara', transport: 'car' },
    { id: 'segment-5', fromNodeId: 'node-nara', toNodeId: 'node-osaka', transport: 'walk' },
  ],
  missingGpsMedia: [
    {
      id: 'media-missing-1',
      type: 'photo',
      uri: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
      takenAt: '2026-03-19T18:05:00.000Z',
      description: 'Dinner photo with no location attached.',
      hasGps: false,
    },
    {
      id: 'media-missing-2',
      type: 'video',
      uri: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=80',
      takenAt: '2026-03-20T18:35:00.000Z',
      description: 'Short clip from a side street, location unknown.',
      hasGps: false,
    },
  ],
};

let currentMockTrip = mockTrip;
const mockTripListeners = new Set<() => void>();

export function getMockTrip() {
  return currentMockTrip;
}

export function updateMockTrip(updater: Trip | ((trip: Trip) => Trip)) {
  currentMockTrip = typeof updater === 'function' ? updater(currentMockTrip) : updater;
  mockTripListeners.forEach((listener) => listener());
}

export function subscribeMockTrip(listener: () => void) {
  mockTripListeners.add(listener);

  return () => {
    mockTripListeners.delete(listener);
  };
}

export function useMockTrip() {
  return useSyncExternalStore(subscribeMockTrip, getMockTrip, getMockTrip);
}
