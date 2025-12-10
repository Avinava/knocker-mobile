import { DispositionType } from '@/utils/constants';

export type { DispositionType };

// Base types
export interface Location {
  latitude: number;
  longitude: number;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch?: number;
  heading?: number;
}

// User types
export interface User {
  Id: string;
  Name: string;
  Email: string;
  profile?: {
    isAdmin: boolean;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token?: string;
  user: User;
  success?: boolean;
  message?: string;
}

// Property types
export interface Property {
  Id: string;
  Name: string;
  // Address fields (API uses Property_ prefix for some)
  Property_Street__c?: string | null;
  Property_City__c?: string | null;
  Property_State__c?: string | null;
  Property_Zip__c?: string | null;
  // Legacy address fields (keeping for compatibility)
  Address__c?: string;
  Street__c?: string | null;
  City__c?: string | null;
  State__c?: string | null;
  Postal_Code__c?: string | null;
  Country__c?: string | null;
  // Location - API returns as separate fields
  Latitude__c: number | null;
  Longitude__c: number | null;
  // Optional compound location field
  Geolocation__c?: {
    latitude: number;
    longitude: number;
  };
  // Owner info
  Owner_1_Name_Full__c?: string | null;
  Owner_2_Name_Full__c?: string | null;
  Owner_Occupied__c?: boolean | null;
  // Property attributes
  Existing_Roof_Type__c?: string | null;
  Roof_Type__c?: string | null;
  Existing_Siding__c?: string | null;
  Has_Solar_On_Roof__c?: boolean | string | null;
  Year_Built_Primary_Structure__c?: number | null;
  // Related records
  Events?: {
    records: Event[];
  };
  Leads__r?: {
    records: Lead[];
  };
  Projects__r?: {
    records: Project[];
  };
}


// Event types
export interface Event {
  Id: string;
  Subject: string;
  Type: string;
  Description: string | null;
  CreatedDate: string;
  ActivityDateTime?: string;
  StartDateTime?: string;
  EndDateTime?: string;
  WhatId: string;
  WhoId?: string;
  Disposition_Type__c: DispositionType;
  Disposition_Status__c: string;
  Existing_Roof_Type__c: string | null;
  Existing_Siding__c: string | null;
  Solar_On_Property__c: string | null;
  Event_Location__Latitude__s: number | null;
  Event_Location__Longitude__s: number | null;
  Submitted_By__c: string;
  Submitted_By__r?: {
    Name: string;
  };
  // Related records for display
  What?: {
    Id: string;
    Name: string;
    Property_Street__c?: string;
    Property_City__c?: string;
  };
  Who?: {
    Id: string;
    Name: string;
    Phone?: string;
    Email?: string;
  };
}

// Appointment is an Event with scheduled time
export type Appointment = Event & {
  StartDateTime: string;
  EndDateTime: string;
};

export interface CreateEventRequest {
  Subject: string;
  Description?: string;
  Type: 'Door Knock';
  WhatId: string;
  Disposition_Type__c: DispositionType;
  Disposition_Status__c: string;
  Existing_Roof_Type__c?: string;
  Existing_Siding__c?: string;
  Solar_On_Property__c?: string;
  Event_Location__Latitude__s: number | null;
  Event_Location__Longitude__s: number | null;
}

export interface CreateAppointmentRequest {
  Subject: string;
  Description?: string;
  Type: 'Appointment' | 'Inspection' | 'Meeting' | 'Follow-up';
  WhatId?: string; // Property ID
  WhoId?: string; // Lead ID
  StartDateTime: string;
  EndDateTime: string;
  Disposition_Type__c?: DispositionType;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> { }

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> { }

// Lead types
export interface Lead {
  Id: string;
  Name: string;
  FirstName: string | null;
  LastName: string | null;
  Email: string | null;
  Phone: string | null;
  Company: string | null;
  Street: string | null;
  City: string | null;
  State: string | null;
  PostalCode: string | null;
  Status: string;
  Lead_Type__c: string;
  Property__c: string;
  CreatedDate: string;
  Description: string | null;
  Submitted_By__c: string;
  Submitted_By__r?: {
    Name: string;
  };
}

export interface CreateLeadRequest {
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Company?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Status: string;
  Lead_Type__c: string;
  Property__c?: string;
  Disposition_Type__c?: DispositionType;
  Description?: string;
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> { }

// Project types
export interface Project {
  Id: string;
  Name: string;
  CreatedDate: string;
  Close_Date__c: string | null;
  Project_Stage__c: string | null;
  Project_Manager__c: string | null;
  Project_Manager__r?: {
    Name: string;
  };
}

// Schema types
export interface PicklistValue {
  label: string;
  value: string;
  default: boolean;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  required: boolean;
  picklistValues?: PicklistValue[];
}

export interface ValueSet {
  fullName: string;
  values: PicklistValue[];
}

export interface SchemaValueSet {
  name: string;
  values: PicklistValue[];
}

export interface PropertySearchParams {
  query?: string;
  address?: string;
  owner?: string;
  city?: string;
  state?: string;
  dispositionType?: DispositionType;
}

export interface PropertyDetailsResponse {
  property: Property;
  events: Event[];
  leads: Lead[];
}

// Offline types
export interface PendingAction {
  id: number;
  entityType: 'event' | 'lead' | 'property';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload: unknown;
  attempts: number;
  lastAttempt: number | null;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
}

export interface SyncResult {
  success: number;
  failed: number;
  errors: Array<{
    action: PendingAction;
    error: string;
  }>;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
    nextPageToken: string | null;
  };
}
