import { openDB, type IDBPDatabase } from 'idb';

export interface VisitRecord {
  id: string;
  familyId: string;
  chaId: string;
  visitDate: string;
  notes: string;
  followUpFlags: string[];
  registeredAt: string;
  undone: boolean;
}

export interface AuditEntry {
  id: string;
  visitId: string;
  familyId: string;
  chaId: string;
  action: 'register' | 'undo';
  timestamp: string;
}

interface NvpDB {
  visits: {
    key: string;
    value: VisitRecord;
    indexes: {
      'by-family': string;
      'by-date': string;
      'by-cha': string;
    };
  };
  auditLog: {
    key: string;
    value: AuditEntry;
    indexes: { 'by-timestamp': string };
  };
}

let dbPromise: Promise<IDBPDatabase<NvpDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<NvpDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NvpDB>('nvp-db', 1, {
      upgrade(db) {
        const visitsStore = db.createObjectStore('visits', { keyPath: 'id' });
        visitsStore.createIndex('by-family', 'familyId', { unique: false });
        visitsStore.createIndex('by-date', 'visitDate', { unique: false });
        visitsStore.createIndex('by-cha', 'chaId', { unique: false });

        const auditStore = db.createObjectStore('auditLog', { keyPath: 'id' });
        auditStore.createIndex('by-timestamp', 'timestamp', { unique: false });
      },
    });
  }
  return dbPromise;
}

export function resetDB(): void {
  dbPromise = null;
}
