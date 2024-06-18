import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'DELETE') {
    const { lead_id } = req.query;
    const token = req.headers.authorization?.split(' ')[1] || '';
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const userId = decoded.userId;

    const client = await pool.connect();

    try {
      await client.query('DELETE FROM leads WHERE id = $1 AND user_id = $2', [lead_id, userId]);
      res.status(200).json({ message: 'Lead deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete lead' });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
