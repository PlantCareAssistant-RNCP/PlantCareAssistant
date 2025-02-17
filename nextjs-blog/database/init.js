import { openDb } from './db.js';

async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS my_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      value TEXT
    )
  `);
  console.log('Database initialized');
}

initDb();