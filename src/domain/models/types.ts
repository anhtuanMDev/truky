export interface Person {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  nationalId?: string; // CCCD
  phone?: string;
  email?: string;
  permanentAddress?: string;
  currentAddress?: string;
  occupation?: string;
  nationality?: string;
  relationshipToHouseholder?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Property {
  id: string;
  title: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  fullAddress?: string;
  ownerPersonId?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Room {
  id: string;
  propertyId: string;
  roomCode?: string;
  name: string;
  areaM2?: number;
  rentPrice?: number;
  deposit?: number;
  status: 'Vacant' | 'Occupied' | 'Maintenance';
  currentTenantIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Contract {
  id: string;
  propertyId: string;
  roomId?: string;
  landlordPersonId: string;
  tenantPersonIds: string[];
  type: 'Rental' | 'Borrow' | 'Stay';
  startDate: string;
  endDate?: string;
  rentPrice?: number;
  deposit?: number;
  contractStatus: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  note?: string;
  
  // Gov Tracking (Flow E & F)
  govContractId?: string;
  submissionDate?: string;
  releaseDate?: string;
  portalStatus?: 'Pending' | 'Approved' | 'Rejected';
  physicalPaperStatus?: 'Not_Collected' | 'Collected_At_Police_Station' | 'Filed_At_Home';
  physicalStorageNote?: string;

  createdAt: number;
  updatedAt: number;
}

export interface ResidenceCase {
  id: string;
  type: 'Registration' | 'Extension' | 'Deletion' | 'Change';
  personId: string;
  propertyId?: string;
  roomId?: string;
  householderPersonId?: string;

  applicationNo?: string;

  submissionDate?: string;
  receivedDate?: string;
  dueDate?: string;
  resultDate?: string;

  temporaryResidenceStartDate?: string;
  temporaryResidenceEndDate?: string;

  renewBeforeDate?: string;

  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';

  authorityName?: string;
  reason?: string;
  note?: string;

  sourceContractId?: string;

  createdAt: number;
  updatedAt: number;
}

export interface FormDraft {
  id: string;
  formType: 'CT01' | 'Contract';
  sourceEntityId?: string;
  data: Record<string, unknown>;
  lastEditedAt: number;
  createdAt: number;
}

export interface ExportFile {
  id: string;
  formType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  createdAt: number;
}
