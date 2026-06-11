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

export const clearRoommateDrafts = () => {
  roommateDraftStore.set([
    { id: '1', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
    { id: '2', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
    { id: '3', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
    { id: '4', fullName: '', nationalId: '', dateOfBirth: '', gender: '', relationshipToHouseholder: '' },
  ]);
};
