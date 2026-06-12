import { Person, Property, Contract } from '../models/types';
import moment from 'moment';

export interface ContractFormData {
  dateDay: string;
  dateMonth: string;
  dateYear: string;
  propertyAddress: string;
  roomName: string;
  duration: string;
  rentPrice: string;

  ownerName: string;
  ownerDob: string;
  ownerNationalId: string;
  ownerAddress: string;

  tenants: Array<{
    index: number;
    fullName: string;
    dob: string;
    nationalId: string;
    address: string;
  }>;
}

export class ContractMapper {
  static mapToForm(
    contract: Contract,
    property: Property,
    owners: Person[],
    tenants: Person[],
  ): ContractFormData {
    const createdAt = moment(contract.createdAt);

    // Sort tenants to ensure the householder is first
    const sortedTenants = [...tenants].sort((a, b) => {
      if (a.id === contract.tenantPersonIds[0]) return -1;
      if (b.id === contract.tenantPersonIds[0]) return 1;
      return 0;
    });

    let durationYears = 1;
    if (contract.startDate && contract.endDate) {
      const start = moment(contract.startDate, 'DD/MM/YYYY');
      const end = moment(contract.endDate, 'DD/MM/YYYY');
      const diffYears = end.diff(start, 'years', true);
      durationYears = Math.round(diffYears * 10) / 10; // Round to 1 decimal
    }

    const formData: ContractFormData = {
      dateDay: createdAt.format('DD'),
      dateMonth: createdAt.format('MM'),
      dateYear: createdAt.format('YYYY'),
      propertyAddress: property.fullAddress || property.addressLine || '',
      roomName: property.title || '',
      duration: durationYears.toString(),
      rentPrice: contract.rentPrice
        ? contract.rentPrice.toLocaleString('vi-VN') + ' VNĐ'
        : '......................',

      ownerName: owners.map(o => o.fullName?.toUpperCase() || '').join(' và '),
      ownerDob: owners.map(o => o.dateOfBirth ? moment(o.dateOfBirth, 'DD/MM/YYYY').format('YYYY') : '').join(' và '),
      ownerNationalId: owners.map(o => o.nationalId || '').join(' và '),
      ownerAddress: owners.map(o => o.permanentAddress || '').join(' và '),

      tenants: sortedTenants.map((t, idx) => ({
        index: idx + 1,
        fullName:
          t.fullName.toUpperCase() ||
          '.............................................',
        dob: t.dateOfBirth
          ? moment(t.dateOfBirth, 'DD/MM/YYYY').format('YYYY')
          : '......................',
        nationalId: t.nationalId || '......................................',
        address:
          t.permanentAddress ||
          '..................................................................................',
      })),
    };

    return formData;
  }
}
