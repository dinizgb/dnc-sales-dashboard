import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const { name, email, phone, password } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();

    try {
      const result = await client.query(
        'INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, phone, hashedPassword]
      );

      const userId = result.rows[0].id;

      return new Response(userId, {
        status: 201,
      })
    } catch (err) {
      return new Response('Failed to create user', {
        status: 500,
      })
    } finally {
      client.release();
    }
}