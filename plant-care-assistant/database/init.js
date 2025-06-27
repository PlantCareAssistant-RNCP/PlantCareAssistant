import { openDb } from './db.js';

async function initDb() {
  const db = await openDb();
  console.log('Database initialized');
}

initDb();