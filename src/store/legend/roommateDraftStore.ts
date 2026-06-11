import { observable } from '@legendapp/state';

export interface RoommateDraft {
  id: string;
  fullName: string;
  nationalId: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  relationshipToHouseholder: string;
}

export const roommateDraftStore = observable<RoommateDraft[]>([
  { id: '1', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
  { id: '2', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
  { id: '3', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
  { id: '4', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
]);

export const initRoommateDrafts = (count: number) => {
  const arr = Array.from({ length: count }).map((_, i) => ({
    id: String(i + 1),
    fullName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: '' as any,
    relationshipToHouseholder: ''
  }));
  roommateDraftStore.set(arr);
};

export const clearRoommateDrafts = () => {
  roommateDraftStore.set([]);
};
