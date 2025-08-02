module.exports = {
  dependencies: {
    // Exclude problematic libraries that cause build issues in CI
    'react-native-gesture-handler': {
      platforms: {
        android: {
          sourceDir: '',
          packageImportPath: '',
        },
      },
    },
    'react-native-reanimated': {
      platforms: {
        android: {
          sourceDir: '',
          packageImportPath: '',
        },
      },
    },
    // Keep other essential libraries that work reliably
    'react-native-sound': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-sound/android',
          packageImportPath: 'import io.github.wkh237.rnfs.RNFSPackage;',
        },
      },
    },
    '@react-native-async-storage/async-storage': {
      platforms: {
        android: {
          sourceDir: '../node_modules/@react-native-async-storage/async-storage/android',
          packageImportPath: 'import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;',
        },
      },
    },
    'react-native-push-notification': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-push-notification/android',
          packageImportPath: 'import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;',
        },
      },
    },
  },
};