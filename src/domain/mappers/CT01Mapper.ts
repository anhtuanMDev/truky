import { Person, Property, ResidenceCase } from '../models/types';
import moment from 'moment';

export interface CT01FormData {
  authorityName: string;
  fullName: string;
  dob: string;
  gender: string;
  nationalId: string;
  phone: string;
  email: string;
  permanentAddress: string;
  currentAddress: string;
  occupation: string;
  householderName: string;
  relationshipToHouseholder: string;
  reason: string;
  coOccupants: Array<{
    index: number;
    fullName: string;
    dob: string;
    gender: string;
    nationalId: string;
    relationship: string;
  }>;
  [key: string]: any; // Allow dynamic n1..n12 and h1..h12 properties
}

export class CT01Mapper {
  static mapToForm(
    primaryPerson: Person,
    property: Property,
    residenceCase: ResidenceCase,
    coOccupants: Person[],
    householder?: Person,
  ): CT01FormData {
    const formData: CT01FormData = {
      authorityName:
        residenceCase.authorityName ||
        `Công an ${property.ward || '...'}, ${property.city || '...'}`,
      fullName: primaryPerson.fullName.toUpperCase(),
      dob: primaryPerson.dateOfBirth || '',
      gender:
        primaryPerson.gender === 'Male'
          ? 'Nam'
          : primaryPerson.gender === 'Female'
          ? 'Nữ'
          : '',
      nationalId: primaryPerson.nationalId || '',
      phone: primaryPerson.phone || '..................................',
      email: primaryPerson.email || '..................................',
      permanentAddress: primaryPerson.permanentAddress || '',
      currentAddress: property.fullAddress || property.addressLine,
      occupation: primaryPerson.occupation || '',

      householderName: householder
        ? householder.fullName.toUpperCase()
        : primaryPerson.fullName.toUpperCase(),
      relationshipToHouseholder:
        primaryPerson.relationshipToHouseholder || 'Chủ hộ',
      reason: residenceCase.reason || 'Đăng ký tạm trú',

      coOccupants: [], // Will be assigned below
    };

    const mappedCoOccupants: any[] = coOccupants.map((co, idx) => ({
      index: idx + 1,
      fullName: co.fullName.toUpperCase(),
      dob: co.dateOfBirth || '',
      gender: co.gender === 'Male' ? 'Nam' : co.gender === 'Female' ? 'Nữ' : '',
      nationalId: co.nationalId || '',
      relationship: co.relationshipToHouseholder || 'Cùng thuê',
    }));

    // Pad to ensure at least 9 data rows for the Word template table (total 10 including title)
    while (mappedCoOccupants.length < 9) {
      mappedCoOccupants.push({
        index: '',
        fullName: '',
        dob: '',
        gender: '',
        nationalId: '',
        relationship: '',
      });
    }

    formData.coOccupants = mappedCoOccupants;

    // Helper to split a string into individual fields for Word table cells (e.g. n1, n2, n3...)
    const splitIntoChars = (str: string, prefix: string) => {
      const chars = (str || '').split('');
      for (let i = 0; i < 12; i++) {
        formData[`${prefix}${i + 1}`] = chars[i] || '';
      }
    };

    splitIntoChars(primaryPerson.nationalId || '', 'n');
    splitIntoChars(
      householder
        ? householder.nationalId || ''
        : primaryPerson.nationalId || '',
      'h',
    );

    return formData;
  }
}
