import { db } from '@vercel/postgres'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(req: Request) {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  if (!authorization) return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
      status: 401,
      headers: {
          'Content-Type': 'application/json'
      }
  })
  
  const { name, email, phone, contacted } = await req.json()

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !contacted?.trim()) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: {
            'Content-Type': 'application/json'
        }
    })
  }

  const client = await db.connect()
  const token = authorization?.split(' ')[1] || ''
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
  const userId = decoded.userId

  try {
    const result = await client.query(
      'INSERT INTO leads (user_id, name, email, phone, contacted) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, name, email, phone, contacted]
    );

    const leadId = result.rows[0].id;

    return new Response(JSON.stringify({ lead_id: leadId }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (e) {
    return new Response(`Failed to create lead: ${e}`, {
      status: 500,
    })
  } finally {
    client.release();
  }
}