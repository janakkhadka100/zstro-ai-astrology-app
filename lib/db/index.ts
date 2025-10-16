// lib/db/index.ts
// Main database export

export { db } from './queries';
export { getPrimaryDb, getReplicaDb, getDb } from './pool';
export * from './schema';
