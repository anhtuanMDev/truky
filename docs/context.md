# Temporary Residence Manager (Vietnam) - Project Specification

## Overview

A local-first React Native application for managing:

- Rental houses and rooms
- Tenants and landlords
- Temporary residence registration (Tạm trú)
- Temporary residence extension (Gia hạn tạm trú)
- Temporary residence deletion (Xóa tạm trú)
- Rental contracts
- Auto-filled government forms
- Document generation and export

The application is designed to work completely offline.

No API connections.

No address lookups.

No image storage.

All data is stored locally using MMKV.

---

# Technology Stack

## Core

- React Native
- TypeScript

## Navigation

- React Navigation

## State Management

- Legend State

## Forms

- React Hook Form
- Zod

## Persistence

- MMKV

## Lists

- Legend List

## Animation

- Reanimated
- Gesture Handler

## Graphics

- Skia

## UI

- Bottom Sheet
- Safe Area Context
- Keyboard Controller
- Nano Icons
- Fast Image

## Utilities

- Moment.js

---

# Project Goals

The application should:

- Work entirely offline
- Automatically fill official forms
- Generate documents from stored data
- Track registration expiration
- Track contract expiration
- Manage tenants efficiently
- Require minimal manual typing
- Be lightweight and fast

---

# Main Modules

## People Module

Stores:

- Landlords
- Tenants
- Household owners
- Family members

Responsibilities:

- Create person
- Edit person
- Archive person
- Search person

---

## Property Module

Stores:

- Houses
- Buildings
- Apartments
- Rental rooms

Responsibilities:

- Manage addresses
- Track occupancy
- Link tenants

---

## Contract Module

Stores:

- Rental contracts
- Borrow contracts
- Stay agreements

Responsibilities:

- Contract lifecycle
- Expiration tracking
- Auto-fill document data

---

## Residence Module

Stores:

- Temporary residence registration
- Temporary residence extension
- Temporary residence deletion
- Residence information changes

Responsibilities:

- Status tracking
- Expiration tracking
- Reminder generation

---

## Form Generator Module

Supported Forms:

### Contract Form

Hợp đồng thuê/mượn/ở nhờ nhà, phòng trọ

### Residence Change Form

Tờ khai thay đổi thông tin cư trú

Responsibilities:

- Auto-fill
- Draft saving
- Validation
- Preview

---

## Export Module

Responsibilities:

- Generate DOCX
- Save generated documents
- Track export history

---

## Reminder Module

Responsibilities:

- Contract expiration
- Residence expiration
- Upcoming renewals
- Overdue registrations

---

# Screens

## Dashboard

Displays:

- Active tenants
- Active contracts
- Expiring contracts
- Expiring registrations
- Quick actions

---

## People List

Features:

- Search
- Filter
- Create
- Edit
- Archive

---

## Person Details

Displays:

- Personal information
- Contracts
- Residence records
- Timeline

---

## Property List

Displays:

- Properties
- Occupancy status
- Room counts

---

## Property Details

Displays:

- Address
- Rooms
- Owner
- Occupants

---

## Room Details

Displays:

- Current tenants
- Current contract
- Status

---

## Contract List

Displays:

- Active
- Expired
- Draft
- Terminated

---

## Contract Details

Displays:

- Parties
- Dates
- Rent information
- Linked documents

---

## Residence Cases List

Displays:

- Registration
- Extension
- Deletion
- Change requests

---

## Residence Case Details

Displays:

- Status
- Submission dates
- Expiration dates
- Notes

---

## Form Builder

Displays:

- Auto-filled fields
- Validation
- Draft state

---

## Document Preview

Displays:

- Generated layout
- Export options

---

## Reminder Center

Displays:

- Upcoming actions
- Overdue items

---

## Settings

Displays:

- Backup
- Restore
- Export preferences
- App settings

---

# Database Architecture

Storage Engine:

MMKV

Approach:

Normalized entities with index keys.

---

# Storage Keys

## Global

```text
app.meta
app.version
settings.global
active.profileId
```

## Indexes

```text
people.index
properties.index
rooms.index
contracts.index
residenceCases.index
formDrafts.index
exports.index
```

## Records

```text
people:{id}
properties:{id}
rooms:{id}
contracts:{id}
residenceCases:{id}
formDrafts:{id}
exports:{id}
```

# Entity Models

## Person

```ts
type Person = {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
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
};
```

---

## Property

```ts
type Property = {
  id: string;
  title: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  fullAddress?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
};
```

---

## Room

```ts
type Room = {
  id: string;
  propertyId: string;
  roomCode?: string;
  name: string;
  areaM2?: number;
  rentPrice?: number;
  deposit?: number;
  status: string;
  currentTenantIds: string[];
  createdAt: number;
  updatedAt: number;
};
```

---

## Contract

```ts
type Contract = {
  id: string;
  propertyId: string;
  roomId?: string;
  tenantPersonIds: string[];
  type: string;
  startDate: string;
  endDate?: string;
  rentPrice?: number;
  deposit?: number;
  contractStatus: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
};
```

---

## Residence Case

```ts
type ResidenceCase = {
  id: string;
  type: string;
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

  status: string;

  authorityName?: string;
  reason?: string;
  note?: string;

  sourceContractId?: string;

  createdAt: number;
  updatedAt: number;
};
```

---

## Form Draft

```ts
type FormDraft = {
  id: string;
  formType: string;
  sourceEntityId?: string;
  data: Record<string, unknown>;
  lastEditedAt: number;
  createdAt: number;
};
```

---

## Export File

```ts
type ExportFile = {
  id: string;
  formType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  createdAt: number;
};
```

---

# Relationships

```text
Person
 ├── Contracts
 ├── Residence Cases
 └── Properties (Owner)

Property
 ├── Rooms
 └── Residence Cases

Room
 ├── Contracts
 └── Occupants

Contract
 ├── Landlord
 ├── Tenants
 └── Residence Cases

Residence Case
 ├── Person
 ├── Property
 ├── Room
 └── Contract
```

---

# State Architecture

```text
MMKV
  ↓
Repository
  ↓
Legend State
  ↓
Hooks
  ↓
Screens
```

---

# Stores

```text
peopleStore
propertyStore
roomStore
contractStore
residenceStore
draftStore
settingsStore
uiStore
```

---

# Repository Layer

Responsibilities:

- Read MMKV
- Write MMKV
- Update indexes
- Handle migrations

Repositories:

```text
peopleRepository
propertyRepository
roomRepository
contractRepository
residenceRepository
draftRepository
exportRepository
```

---

# Hooks

## Data Hooks

```text
usePeople()
usePerson(id)

useProperties()
useProperty(id)

useRooms()
useRoom(id)

useContracts()
useContract(id)

useResidenceCases()
useResidenceCase(id)
```

## Form Hooks

```text
useContractForm()

useResidenceRegisterForm()

useResidenceRenewForm()

useResidenceDeleteForm()

useResidenceChangeForm()
```

## Utility Hooks

```text
useReminders()

useDocumentExport()

useSearch()
```

---

# Form Architecture

```text
React Hook Form
      ↓
Zod Validation
      ↓
Mapper
      ↓
Repository
      ↓
MMKV
```

---

# Validation

Schemas:

```text
personSchema
propertySchema
roomSchema
contractSchema
residenceCaseSchema

contractFormSchema
registerFormSchema
renewFormSchema
deleteFormSchema
changeInfoFormSchema
```

Validation:

- CCCD
- Dates
- Required fields
- Expiration rules
- Contract duration

---

# Document Generation

## Supported

- DOCX

## Flow

```text
Entity
 ↓
Mapper
 ↓
Template Variables
 ↓
DOCX Generator
 ↓
Documents Directory
 ↓
Export Metadata
```

---

# Preview System

Options:

## Text Preview

Simple document layout.

## Skia Preview

Document-like rendered page.

Benefits:

- Fast
- Lightweight
- Offline

---

# Utilities

## Date

```text
formatDate
calculateExpiry
daysRemaining
isExpired
```

## Person

```text
formatCCCD
formatPhone
normalizeName
```

## Contract

```text
contractStatus
calculateDuration
```

## Residence

```text
needsRenewal
renewalReminder
```

---

# Component Structure

## Base

```text
AppHeader
SearchInput
StatusBadge
SectionCard
ActionBar
```

## Form

```text
TextField
DateField
SelectField
NumberField
TextAreaField
```

## List

```text
PersonRow
PropertyRow
RoomRow
ContractRow
ResidenceCaseRow
```

## Document

```text
DocHeader
DocSection
DocLine
SignatureBlock
```

---

# Animation Strategy

## Reanimated

- Screen transitions
- Expandable sections
- Swipe actions
- Form transitions

## Gesture Handler

- Swipe delete
- Swipe archive
- Drag interactions

## Bottom Sheet

- Picker dialogs
- Filters
- Person selector
- Property selector

---

# Folder Structure

```text
src/
├── app/
│   ├── navigation/
│   ├── providers/
│   └── screens/
│
├── domain/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   └── mappers/
│
├── storage/
│   ├── mmkv/
│   ├── migrations/
│   └── keys/
│
├── store/
│   ├── legend/
│   └── hydration/
│
├── hooks/
│
├── components/
│   ├── base/
│   ├── forms/
│   ├── lists/
│   └── documents/
│
├── utils/
│
├── constants/
│
├── types/
│
└── assets/
```

---

# Application Startup Flow

```text
App Launch
    ↓
Load MMKV
    ↓
Hydrate Legend State
    ↓
Calculate Reminders
    ↓
Initialize Navigation
    ↓
Dashboard
```

---

# Save Flow

```text
User Input
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
Mapper
    ↓
Repository
    ↓
MMKV
    ↓
Legend State Update
```

---

# Export Flow

```text
Select Record
      ↓
Generate Payload
      ↓
Apply Template
      ↓
Generate DOCX
      ↓
Save File
      ↓
Store Metadata
      ↓
Display Result
```

---

# MVP Features

- Person management
- Property management
- Room management
- Contract management
- Residence registration
- Residence extension
- Residence deletion
- Form auto-fill
- Document preview
- DOCX export
- Reminder system
- Backup and restore

---

# Future Features

- OCR import
- Signature capture
- Multiple form templates
- Timeline history
- Batch export
- PDF export
- Data synchronization
- Multi-user support

---

# Architecture Summary

Presentation Layer

- Screens
- Components

State Layer

- Legend State

Form Layer

- React Hook Form
- Zod

Business Layer

- Services
- Repositories
- Mappers

Persistence Layer

- MMKV

---

# Current Actual State & Architecture (Updated June 2026)

## Multi-Owner Support
The application was refactored to support multiple landlords globally. 
- The `isOwner` flag in `Person` distinguishes landlords from regular tenants.
- Properties no longer strictly tie to a single `ownerPersonId`.
- Contracts no longer strictly tie to a single `landlordPersonId`.
- When generating a document (e.g., Contract or CT01), the system fetches all individuals with `isOwner = true` from the global people list and merges them together as "Bên A" (e.g., joined by "và").

## Document Generation Pipeline
When exporting a document:
1. The app queries the domain models (Property, Contract, Tenants, and global Owners).
2. The data passes through a Mapper (`ContractMapper` or `CT01Mapper`), flattening into key-value pairs for `docxtemplater`.
3. Empty values are aggressively handled to output dot-placeholders (e.g., `..........`).
4. `docxGenerator.ts` processes a Base64-encoded DOCX template, injects mapped values, and outputs a ready-to-share file.

## UI/UX Refinements
- **Date Inputs**: Standardized using `@react-native-community/datetimepicker` for DOB, release dates, etc., to prevent invalid manual input.
- **Visual Consistency**: Status bars correctly inherit theme colors to match headers seamlessly. Custom Linear Grid Icons built via standard Views.

Document Layer

- DOCX Generator

Design Principle:

Local First → Fast → Offline → Lightweight → Maintainable

---

# Development Guidelines & Rules

## 1. Cấu trúc dự án (Project Structure)
Dự án được tổ chức theo cấu trúc Clean Architecture cơ bản để đảm bảo tính module hóa:
- `src/app/`: Chứa Presentation Layer (UI, Navigation, Screens, Components).
- `src/domain/`: Chứa Business Layer (Models/Types, Schema, Mappers chuẩn bị dữ liệu xuất DOCX).
- `src/infrastructure/`: Chứa Persistence Layer (Tương tác trực tiếp MMKV, Repositories).
- `src/hooks/`: Chứa Custom Hooks để giao tiếp với Legend State (ví dụ: `usePeople`, `useProperties`).
- `src/constants/`: Chứa Theme (`colors`, `typography`), cấu hình chung.
- `src/assets/`: Chứa templates `.docx`, icon font (`nanoicons`).

## 2. Cách Handle Form
- **Bắt buộc dùng `react-hook-form` + `zod`**: Mọi form nhập liệu (thêm nhà, thêm người, tạo hợp đồng) đều phải khai báo validation schema bằng `zod` và quản lý trạng thái form qua `react-hook-form` (`Controller`).
- **Validation Rule**: Xử lý lỗi chặt chẽ, nếu thiếu thông tin bắt buộc phải hiện rõ câu thông báo (ví dụ: "Vui lòng nhập họ và tên").

## 3. Cách dùng State
- **Global / Persisted State**: Quản lý bởi `@legendapp/state`. Tuyệt đối không gọi trực tiếp store trong Component. Bắt buộc phải bọc và gọi thông qua các Custom Hooks đã dựng sẵn (vd: `const { properties, saveProperty } = useProperties()`). Legend state sẽ tự động persist xuống `MMKV`.
- **UI State**: Các state nhỏ lẻ chỉ dùng để render UI (như `showModal`, `showDatePicker`) thì vẫn dùng `useState` thông thường trong Component.

## 4. Những Nghiêm Cấm (Strict Prohibitions)
1. **KHÔNG GỌI API NGOÀI**: Ứng dụng phải hoạt động **100% Offline** (Local-first). Cấm chèn mã gọi API, fetch data từ backend hay SDK bên thứ ba yêu cầu mạng.
2. **KHÔNG CÀI THÊM THƯ VIỆN ICON**: Hiện tại dự án dùng font tự build qua `react-native-nano-icons`. Tuyệt đối không `npm install react-native-vector-icons` hay thư viện icon khác để tránh phình dung lượng app và conflict. Nếu cần icon mới: Tự vẽ bằng `View` thuần (ví dụ GridIcon).
3. **KHÔNG PHÁ VỠ TÍNH TƯƠNG THÍCH DỮ LIỆU CŨ (BACKWARD COMPATIBILITY)**: Bất kỳ thay đổi nào trong Interface/Type (`src/domain/models/types.ts`) phải có giá trị mặc định/fallback do dữ liệu JSON cũ lưu trong máy người dùng (MMKV) sẽ không tự convert.
4. **KHÔNG TÙY TIỆN ĐỔI MÀU HARDCODE**: Giao diện bắt buộc phải dùng biến màu khai báo từ `Theme.colors` (vd: `Theme.colors.primary`, `Theme.colors.surface`) thay vì hardcode mã hex (vd: `#FFF`) để hỗ trợ đồng bộ hiển thị.
