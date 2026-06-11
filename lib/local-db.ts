import * as SQLite from 'expo-sqlite';

export const localDb = SQLite.openDatabaseSync('wanderable.db');

export function initializeLocalDb() {
  localDb.execSync(`
    PRAGMA journal_mode = WAL;
  `);
}
