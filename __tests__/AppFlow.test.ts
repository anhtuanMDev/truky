import { propertyActions, propertyState } from '../src/store/legend/propertyStore';
import { peopleActions, peopleState } from '../src/store/legend/peopleStore';
import { contractActions, contractState } from '../src/store/legend/contractStore';
import { Property, Person, Contract } from '../src/domain/models/types';
import { generateDocx } from '../src/utils/docxGenerator';
import { CONTRACT_BASE64 } from '../src/assets/templates/templatesBase64';

// Mock react-native-fs completely before any imports rely on it
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  writeFile: jest.fn().mockResolvedValue(true),
}));

describe('App Core Flow Tests', () => {
  
  beforeEach(() => {
    // Reset stores before each test to ensure isolation
    propertyState.properties.set({});
    peopleState.people.set({});
    contractState.contracts.set({});
  });

  const mockProperty: Property = {
    id: 'p1',
    title: 'Phòng 101',
    addressLine: '123 Test St',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockPerson: Person = {
    id: 'pe1',
    fullName: 'Nguyen Van Khach',
    gender: 'Male',
    nationalId: '012345678912',
    phone: '0900000000',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const mockContract: Contract = {
    id: 'c1',
    propertyId: 'p1',
    tenantPersonIds: ['pe1'],
    type: 'Đăng ký tạm trú',
    startDate: '01/01/2026',
    endDate: '01/01/2027',
    contractStatus: 'Active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it('1. Thêm phòng (Create Property)', () => {
    propertyActions.saveProperty(mockProperty);
    const properties = propertyState.properties.get();
    expect(properties['p1']).toBeDefined();
    expect(properties['p1'].title).toBe('Phòng 101');
  });

  it('2. Cập nhật thông tin phòng (Update Property)', () => {
    propertyActions.saveProperty(mockProperty);
    const updatedProperty = { ...mockProperty, title: 'Phòng 102 VIP' };
    propertyActions.saveProperty(updatedProperty);
    
    const properties = propertyState.properties.get();
    expect(properties['p1'].title).toBe('Phòng 102 VIP');
  });

  it('3. Thêm khách (Create Tenant)', () => {
    peopleActions.savePerson(mockPerson);
    const people = peopleState.people.get();
    expect(people['pe1']).toBeDefined();
    expect(people['pe1'].fullName).toBe('Nguyen Van Khach');
  });

  it('4. Cập nhật tenant (Update Tenant)', () => {
    peopleActions.savePerson(mockPerson);
    const updatedPerson = { ...mockPerson, phone: '0911111111' };
    peopleActions.savePerson(updatedPerson);
    
    const people = peopleState.people.get();
    expect(people['pe1'].phone).toBe('0911111111');
  });

  it('5. Tạo hợp đồng (Create Contract)', () => {
    contractActions.saveContract(mockContract);
    const contracts = contractState.contracts.get();
    expect(contracts['c1']).toBeDefined();
    expect(contracts['c1'].type).toBe('Đăng ký tạm trú');
    expect(contracts['c1'].contractStatus).toBe('Active');
  });

  it('6. Cập nhật hợp đồng (Update Contract)', () => {
    contractActions.saveContract(mockContract);
    const updatedContract: Contract = { ...mockContract, rentPrice: 5000000 };
    contractActions.saveContract(updatedContract);
    
    const contracts = contractState.contracts.get();
    expect(contracts['c1'].rentPrice).toBe(5000000);
  });

  it('7. Xuất hợp đồng (Export Contract)', async () => {
    // This tests the docxGenerator which uses react-native-fs
    const formData = {
      fullName: 'Test'
    };
    const result = await generateDocx(CONTRACT_BASE64, formData, 'TestFile.docx');
    expect(result).toBe('/mock/path/TestFile.docx');
  });

  it('8. Gia hạn hợp đồng (Extend Contract)', () => {
    // In our app, extending is creating a new contract with new dates
    contractActions.saveContract(mockContract);
    
    const extendedContract: Contract = {
      ...mockContract,
      id: 'c2',
      startDate: '01/01/2027',
      endDate: '01/01/2028',
      type: 'Gia hạn tạm trú',
    };
    
    contractActions.saveContract(extendedContract);
    
    const contracts = contractState.contracts.get();
    expect(contracts['c1']).toBeDefined();
    expect(contracts['c2']).toBeDefined();
    expect(contracts['c2'].type).toBe('Gia hạn tạm trú');
    expect(contracts['c2'].endDate).toBe('01/01/2028');
  });

  it('9. Chấm dứt hợp đồng (Terminate Contract)', () => {
    // The termination flow updates the old contract status to Terminated
    // and creates a new contract of type "Xóa tạm trú"
    contractActions.saveContract(mockContract);
    
    // Step 1: Update old contract
    const terminatedOldContract: Contract = {
      ...mockContract,
      contractStatus: 'Terminated',
      updatedAt: Date.now()
    };
    contractActions.saveContract(terminatedOldContract);
    
    // Step 2: Create "Xóa tạm trú" contract
    const terminationContract: Contract = {
      id: 'c3',
      propertyId: 'p1',
      tenantPersonIds: ['pe1'],
      type: 'Xóa tạm trú',
      startDate: '01/01/2027', // The date of termination
      contractStatus: 'Active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    contractActions.saveContract(terminationContract);
    
    const contracts = contractState.contracts.get();
    expect(contracts['c1'].contractStatus).toBe('Terminated');
    expect(contracts['c3'].type).toBe('Xóa tạm trú');
  });

  it('10. Thông báo / Tính năng khác (Notifications/Bonus Features)', () => {
    // Since notifications are UI alerts in the current implementation,
    // we can test the metadata saving logic used for extra info (like govContractId)
    contractActions.saveContract(mockContract);
    
    const updatedWithMetadata: Contract = {
      ...mockContract,
      govContractId: 'GOV-123456',
      releaseDate: '15/06/2026'
    };
    
    contractActions.saveContract(updatedWithMetadata);
    
    const contracts = contractState.contracts.get();
    expect(contracts['c1'].govContractId).toBe('GOV-123456');
    expect(contracts['c1'].releaseDate).toBe('15/06/2026');
  });
});
