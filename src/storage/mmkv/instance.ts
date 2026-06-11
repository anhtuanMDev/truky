import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'truky-storage',
});

export const StorageKeys = {
  GLOBAL_SETTINGS: 'settings.global',
  ACTIVE_PROFILE: 'active.profileId',
  PEOPLE_INDEX: 'people.index',
  PROPERTIES_INDEX: 'properties.index',
  ROOMS_INDEX: 'rooms.index',
  CONTRACTS_INDEX: 'contracts.index',
  RESIDENCE_CASES_INDEX: 'residenceCases.index',
};
