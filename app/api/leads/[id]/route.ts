import { headers } from 'next/headers';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function DELETE({ params }: { params: { id: string } }) {
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  const token = authorization?.split(' ')[1] || '';
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
  const userId = decoded.userId;

  const client = await pool.connect()
  const leadId = params.id

  try {
    await client.query('DELETE FROM leads WHERE id = $1 AND user_id = $2', [leadId, userId]);
    return new Response('Lead deleted', {
      status: 200,
    })
  } catch (err) {
    return new Response('Failed to delete profile', {
      status: 500,
    })
  } finally {
    client.release();
  }
}