import { openDb } from '../../database/db';

export default async function handler(req, res) {
  const db = await openDb();

  if (req.method === 'GET') {
    // Fetch data from the database
    const data = await db.all('SELECT * FROM my_table');
    res.status(200).json(data);
  } else if (req.method === 'POST') {
    // Insert data into the database
    const { name, value } = req.body;
    await db.run('INSERT INTO my_table (name, value) VALUES (?, ?)', [name, value]);
    res.status(201).json({ message: 'Data inserted successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}