import { CT01Mapper } from '../src/domain/mappers/CT01Mapper';
import { Person, Property, ResidenceCase } from '../src/domain/models/types';

describe('CT01Mapper', () => {
  const mockPrimaryPerson: Person = {
    id: '1',
    fullName: 'Nguyen Van A',
    dateOfBirth: '01/01/1990',
    gender: 'Male',
    nationalId: '012345678901',
    phone: '0901234567',
    email: 'a@example.com',
    permanentAddress: '123 ABC, Ha Noi',
    occupation: 'IT',
    relationshipToHouseholder: 'Chủ hộ',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockProperty: Property = {
    id: 'p1',
    title: 'Phòng 1',
    addressLine: '12 Đường 3',
    ward: 'Linh Xuan',
    city: 'TP HCM',
    fullAddress: '12 Đường 3, Linh Xuan, Thu Duc, TP HCM',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockCase: ResidenceCase = {
    id: 'c1',
    type: 'Registration',
    personId: '1',
    sourceContractId: 'c1',
    reason: 'Đăng ký tạm trú',
    status: 'Pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it('should map primary person details correctly', () => {
    const formData = CT01Mapper.mapToForm(mockPrimaryPerson, mockProperty, mockCase, []);
    
    expect(formData.fullName).toBe('NGUYEN VAN A');
    expect(formData.gender).toBe('Nam');
    expect(formData.nationalId).toBe('012345678901');
    expect(formData.phone).toBe('0901234567');
    expect(formData.currentAddress).toBe(mockProperty.fullAddress);
    expect(formData.reason).toBe('Đăng ký tạm trú');
  });

  it('should split national ID into individual fields n1..n12', () => {
    const formData = CT01Mapper.mapToForm(mockPrimaryPerson, mockProperty, mockCase, []);
    
    expect(formData.n1).toBe('0');
    expect(formData.n2).toBe('1');
    expect(formData.n12).toBe('1');
  });

  it('should pad coOccupants array to have 9 elements minimum', () => {
    const coOccupant: Person = {
      id: '2',
      fullName: 'Nguyen Van B',
      gender: 'Male',
      nationalId: '987654321098',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const formData = CT01Mapper.mapToForm(mockPrimaryPerson, mockProperty, mockCase, [coOccupant]);
    
    expect(formData.coOccupants.length).toBe(9);
    expect(formData.coOccupants[0].fullName).toBe('NGUYEN VAN B');
    expect(formData.coOccupants[0].index).toBe(1);
    expect(formData.coOccupants[1].fullName).toBe('');
  });
});
