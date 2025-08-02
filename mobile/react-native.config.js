module.exports = {
  dependencies: {
    // Completely disable problematic libraries that cause build issues in CI
    'react-native-gesture-handler': {
      platforms: {
        android: null, // disable Android platform
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: null, // disable Android platform
      },
    },
  },
};