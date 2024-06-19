import { NextApiRequest, NextApiResponse } from 'next';
import { headers } from 'next/headers';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const { name, email, phone, contacted } = await req.json();

  const client = await pool.connect()

  try {
    const result = await client.query(
      'INSERT INTO leads (user_id, name, email, phone, contacted) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['0xx', name, email, phone, contacted]
    );

    const leadId = result.rows[0].id;

    return new Response(`Lead created: ${leadId}`, {
      status: 200,
    })
  } catch (err) {
    return new Response('Failed to create lead', {
      status: 500,
    })
  } finally {
    client.release();
  }
}