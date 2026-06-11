import 'react-native';

declare module 'react-native' {
  interface ImageProps {
    className?: string;
  }

  interface PressableProps {
    className?: string;
  }

  interface ViewProps {
    className?: string;
  }

  interface TextProps {
    className?: string;
  }
}
