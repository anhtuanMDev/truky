import { z } from 'zod';

// Rule: Citizen Identity Card (CCCD) must be exactly 12 numeric characters
export const CCCDSchema = z.string().regex(/^\d{12}$/, 'CCCD/CMND phải bao gồm chính xác 12 chữ số');

export const PersonSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, 'Họ tên quá ngắn').max(100, 'Họ tên quá dài'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  nationalId: CCCDSchema.optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  permanentAddress: z.string().optional(),
  currentAddress: z.string().optional(),
  occupation: z.string().optional(),
  nationality: z.string().default('Việt Nam').optional(),
  relationshipToHouseholder: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const PropertySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Vui lòng nhập tên nhà/căn hộ'),
  addressLine: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  ward: z.string().optional(),
  city: z.string().optional(),
  fullAddress: z.string().optional(),
  ownerPersonId: z.string().optional(),
  note: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ContractSchema = z.object({
  id: z.string(),
  propertyId: z.string().min(1, 'Chưa chọn nhà/căn hộ'),
  roomId: z.string().optional(),
  landlordPersonId: z.string().min(1, 'Chưa có thông tin chủ nhà'),
  tenantPersonIds: z.array(z.string()).min(1, 'Phải có ít nhất 1 người thuê').max(5, 'Tối đa 5 người thuê cho một phòng'),
  type: z.enum(['Rental', 'Borrow', 'Stay']),
  startDate: z.string().min(1, 'Chưa chọn ngày bắt đầu'),
  endDate: z.string().optional(),
  rentPrice: z.number().min(0).optional(),
  deposit: z.number().min(0).optional(),
  contractStatus: z.enum(['Draft', 'Active', 'Expired', 'Terminated']),
  note: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).refine((data) => {
  if (data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    return false;
  }
  return true;
}, {
  message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu',
  path: ['endDate'],
});
