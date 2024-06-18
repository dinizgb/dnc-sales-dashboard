import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { name, email, phone, contacted } = req.body;
    const token = req.headers.authorization?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const userId = decoded.userId;

    const client = await pool.connect();

    try {
      const result = await client.query(
        'INSERT INTO leads (user_id, name, email, phone, contacted) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, name, email, phone, contacted]
      );

      const leadId = result.rows[0].id;

      res.status(201).json({ leadId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create lead' });
    } finally {
      client.release();
    }
  } else if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const userId = decoded.userId;

    const client = await pool.connect();

    try {
      const result = await client.query('SELECT * FROM leads WHERE user_id = $1', [userId]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve leads' });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
