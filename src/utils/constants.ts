export const DISPOSITION_TYPES = [
  'Insurance Restoration',
  'Solar Replacement',
  'Community Solar',
] as const;

export const DISPOSITION_TYPE_MAP = {
  INSURANCE_RESTORATION: 'Insurance Restoration',
  SOLAR_REPLACEMENT: 'Solar Replacement',
  COMMUNITY_SOLAR: 'Community Solar',
} as const;

export type DispositionType = typeof DISPOSITION_TYPES[number];

export const DISPOSITION_VALUE_SETS: Record<string, string> = {
  'Insurance Restoration': 'Storm_Inspection_Knock_Status',
  'Solar Replacement': 'Solar_Knock_Status',
  'Community Solar': 'Community_Solar_Knock_Status',
};

export const EVENT_TYPES = {
  DOOR_KNOCK: 'Door Knock',
} as const;

export const LEAD_TYPES = {
  INSURANCE_RESTORATION: 'Insurance Restoration',
  SOLAR_REPLACEMENT: 'Solar Replacement',
  COMMUNITY_SOLAR: 'Community Solar',
} as const;

export const LEAD_STATUS = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  UNQUALIFIED: 'Unqualified',
  SOLD: 'Sold',
} as const;

export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCING: 'syncing',
  SYNCED: 'synced',
  FAILED: 'failed',
} as const;

export const OFFLINE_CONFIG = {
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  MAX_OFFLINE_TILES_MB: 500,
};

export const TOAST_CONFIG = {
  DURATION: 3000,
  SUCCESS_DURATION: 2000,
  ERROR_DURATION: 4000,
};
