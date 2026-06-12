import { ContractMapper } from '../src/domain/mappers/ContractMapper';
import { Person, Property, Contract } from '../src/domain/models/types';
import moment from 'moment';

describe('ContractMapper', () => {
  const mockOwner: Person = {
    id: 'o1',
    fullName: 'Le Van Chu',
    dateOfBirth: '01/01/1980',
    gender: 'Male',
    nationalId: '111111111111',
    permanentAddress: '123 Chu Nha, HCM',
    isOwner: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockTenant: Person = {
    id: 't1',
    fullName: 'Nguyen Van Khach',
    dateOfBirth: '01/01/2000',
    gender: 'Male',
    nationalId: '222222222222',
    permanentAddress: '456 Que, Ha Noi',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockProperty: Property = {
    id: 'p1',
    title: 'Phòng 101',
    addressLine: '789 Tro, HCM',
    fullAddress: '789 Tro, HCM',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockContract: Contract = {
    id: 'c1',
    propertyId: 'p1',
    tenantPersonIds: ['t1'],
    type: 'Đăng ký tạm trú',
    startDate: '01/01/2026',
    endDate: '01/01/2027',
    rentPrice: 3000000,
    deposit: 3000000,
    contractStatus: 'Active',
    createdAt: new Date('2026-01-01T00:00:00.000Z').getTime(),
    updatedAt: new Date('2026-01-01T00:00:00.000Z').getTime()
  };

  it('should map contract data correctly', () => {
    const formData = ContractMapper.mapToForm(mockContract, mockProperty, [mockOwner], [mockTenant]);

    expect(formData.dateDay).toBe('01');
    expect(formData.dateMonth).toBe('01');
    expect(formData.dateYear).toBe('2026');

    expect(formData.propertyAddress).toBe(mockProperty.fullAddress);
    expect(formData.roomName).toBe('Phòng 101');
    
    // Duration from 01/01/2026 to 01/01/2027 is 1 year
    expect(formData.duration).toBe('1');
    expect(formData.rentPrice).toBe('3.000.000 VNĐ');

    expect(formData.ownerName).toBe('LE VAN CHU');
    expect(formData.ownerDob).toBe('1980'); // Extracting year
    expect(formData.ownerNationalId).toBe('111111111111');
    expect(formData.ownerAddress).toBe('123 Chu Nha, HCM');
  });

  it('should format tenants array correctly', () => {
    const formData = ContractMapper.mapToForm(mockContract, mockProperty, [mockOwner], [mockTenant]);

    expect(formData.tenants.length).toBe(1);
    expect(formData.tenants[0].index).toBe(1);
    expect(formData.tenants[0].fullName).toBe('NGUYEN VAN KHACH');
    expect(formData.tenants[0].dob).toBe('2000');
    expect(formData.tenants[0].nationalId).toBe('222222222222');
    expect(formData.tenants[0].address).toBe('456 Que, Ha Noi');
  });
});
