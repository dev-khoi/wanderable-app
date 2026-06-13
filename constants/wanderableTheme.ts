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
      glass: 'rgba(255, 255, 255, 0.88)',
      darkGlass: 'rgba(9, 7, 35, 0.72)',
      cardBorder: '#ECE7F1',
    },
    map: {
      ocean: '#0B172A',
      land: '#234D35',
      landLight: '#5E8F52',
      route: '#FFFFFF',
      routeShadow: 'rgba(28, 18, 67, 0.32)',
      globeGlow: 'rgba(255, 255, 255, 0.04)',
      globeGlowHalo: 'rgba(36, 165, 158, 0.1)',
      globeGlowRing: 'rgba(255, 255, 255, 0.16)',
      activePin: '#DF3B6F',
      inactivePin: '#F4F0F4',
      pinBorder: '#FFFFFF',
      missing: '#F5A623',
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
