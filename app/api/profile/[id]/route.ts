import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { profile_id } = req.query;
  const token = req.headers.authorization?.split(' ')[1] || '';
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
  const userId = decoded.userId;

  if (req.method === 'PUT') {
    const { name, email, phone, password } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const client = await pool.connect();

    try {
      await client.query(
        'UPDATE users SET name = $1, email = $2, phone = $3, password = $4 WHERE id = $5',
        [name, email, phone, hashedPassword || password, userId]
      );
      res.status(200).json({ message: 'Profile updated' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile' });
    } finally {
      client.release();
    }
  } else if (req.method === 'DELETE') {
    const client = await pool.connect();

    try {
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      res.status(200).json({ message: 'Profile deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete profile' });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
