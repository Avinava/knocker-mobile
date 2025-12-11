export const SCHEMA = {
    properties: `
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      updated_at INTEGER,
      synced_at INTEGER
    );
  `,
    events: `
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE,
      property_id TEXT,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      synced_at INTEGER
    );
  `,
    leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      local_id TEXT UNIQUE,
      property_id TEXT,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      synced_at INTEGER
    );
  `,
    sync_queue: `
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      last_attempt INTEGER,
      created_at INTEGER
    );
  `,
    value_sets: `
    CREATE TABLE IF NOT EXISTS value_sets (
      name TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at INTEGER
    );
  `,
    indices: [
        'CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude);',
        'CREATE INDEX IF NOT EXISTS idx_events_property ON events(property_id);',
        'CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(entity_type, action);'
    ]
};

export const MIGRATIONS = [
    // Migration 1: Initial Schema
    async (db: any) => {
        await db.execAsync(SCHEMA.properties);
        await db.execAsync(SCHEMA.events);
        await db.execAsync(SCHEMA.leads);
        await db.execAsync(SCHEMA.sync_queue);
        await db.execAsync(SCHEMA.value_sets);
        for (const index of SCHEMA.indices) {
            await db.execAsync(index);
        }
    }
];
