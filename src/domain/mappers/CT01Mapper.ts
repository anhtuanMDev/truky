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
    fullName: string;
    dob: string;
    gender: string;
    nationalId: string;
    relationship: string;
  }>;
}

export class CT01Mapper {
  static mapToForm(
    primaryPerson: Person,
    property: Property,
    residenceCase: ResidenceCase,
    coOccupants: Person[],
    householder?: Person
  ): CT01FormData {
    return {
      authorityName: residenceCase.authorityName || `Công an phường/xã ${property.ward || '...'}, quận/huyện ${property.district || '...'}`,
      fullName: primaryPerson.fullName.toUpperCase(),
      dob: primaryPerson.dateOfBirth ? moment(primaryPerson.dateOfBirth).format('DD/MM/YYYY') : '',
      gender: primaryPerson.gender === 'Male' ? 'Nam' : primaryPerson.gender === 'Female' ? 'Nữ' : '',
      nationalId: primaryPerson.nationalId || '',
      phone: primaryPerson.phone || '',
      email: primaryPerson.email || '',
      permanentAddress: primaryPerson.permanentAddress || '',
      currentAddress: property.fullAddress || property.addressLine,
      occupation: primaryPerson.occupation || '',
      
      householderName: householder ? householder.fullName.toUpperCase() : primaryPerson.fullName.toUpperCase(),
      relationshipToHouseholder: primaryPerson.relationshipToHouseholder || 'Chủ hộ',
      reason: residenceCase.reason || 'Đăng ký tạm trú',
      
      coOccupants: coOccupants.map(co => ({
        fullName: co.fullName.toUpperCase(),
        dob: co.dateOfBirth ? moment(co.dateOfBirth).format('DD/MM/YYYY') : '',
        gender: co.gender === 'Male' ? 'Nam' : co.gender === 'Female' ? 'Nữ' : '',
        nationalId: co.nationalId || '',
        relationship: co.relationshipToHouseholder || 'Cùng thuê',
      })),
    };
  }
}
