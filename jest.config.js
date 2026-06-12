module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-safe-area-context|react-native-gesture-handler|@gorhom/bottom-sheet|react-native-reanimated|@legendapp/state)/',
  ],
};
