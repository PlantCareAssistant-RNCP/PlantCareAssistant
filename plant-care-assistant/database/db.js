import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open a SQLite database connection
export async function openDb() {
  return open({
    filename: '/app/database/my-database.db',
    driver: sqlite3.Database,
  });
}
