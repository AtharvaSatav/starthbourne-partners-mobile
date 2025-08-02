module.exports = {
  dependencies: {
    // Disable ALL React Native libraries for clean native build
    'react-native-gesture-handler': {
      platforms: {
        android: null,
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: null,
      },
    },
    'react-native-push-notification': {
      platforms: {
        android: null,
      },
    },
    'react-native-sound': {
      platforms: {
        android: null,
      },
    },
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: null,
      },
    },
    'react-native-screens': {
      platforms: {
        android: null,
      },
    },
    'react-native-safe-area-context': {
      platforms: {
        android: null,
      },
    },
    '@react-navigation/native': {
      platforms: {
        android: null,
      },
    },
    '@react-navigation/native-stack': {
      platforms: {
        android: null,
      },
    },
  },
};