import { headers } from 'next/headers';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { name, email, phone } = await req.json()
  // const headersList = headers()
  // const authorization = headersList.get('Authorization')
  // const token = authorization?.split(' ')[1] || ''

  const client = await pool.connect()
  const profileId = params.id

  try {
    await client.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4',
      [name, email, phone, profileId]
    )
    return new Response('Profile updated', {
      status: 200,
    })
  } catch (err) {
    return new Response('Failed to update profile', {
      status: 500,
    })
  } finally {
    client.release()
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const headersList = headers()
  const authorization = headersList.get('Authorization')
  const token = authorization?.split(' ')[1] || ''
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
  const userId = decoded.userId

  const client = await pool.connect()
  const profileId = params.id

  try {
    await client.query('DELETE FROM leads WHERE id = $1 AND user_id = $2', [profileId, userId]);
    return new Response('Lead deleted', {
      status: 200,
    })
  } catch (err) {
    return new Response('Failed to delete profile', {
      status: 500,
    })
  } finally {
    client.release()
  }
}