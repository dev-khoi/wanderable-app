export const wanderableTheme = {
  colors: {
    background: {
      darkMap: '#121212',
      deepSpace: '#070711',
      surface: '#FFFFFF',
    },
    brand: {
      primary: '#24A59E',
      secondary: '#DF3B6F',
    },
    text: {
      inverse: '#FFFFFF',
      primary: '#1C1243',
      strong: '#151918',
      subtle: '#A5A7AC',
      accent: '#090723',
      muted: '#A29EB6',
    },
    icon: {
      default: '#1C1243',
      notification: '#DF3B6F',
    },
    surface: {
      default: '#FFFFFF',
      muted: '#D9D9D9',
      soft: '#F3E7E7',
      avatar: '#E9E6EA',
      avatarFill: '#CFC8D1',
    },
    overlay: {
      mapScrim: 'rgba(30, 21, 27, 0.18)',
      spaceScrim: 'rgba(4, 6, 20, 0.18)',
    },
    shadow: {
      default: '#000000',
    },
  },
  radii: {
    referenceSurface: 40,
  },
} as const;

export type WanderableTheme = typeof wanderableTheme;
