import { db } from '@vercel/postgres'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function PUT(req: Request) {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  if (!authorization) return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
      status: 401,
      headers: {
          'Content-Type': 'application/json'
      }
  })

  const { name, phone } = await req.json()

    if (!name?.trim() || !phone?.trim()) {
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
    const checkUser = await client.query('SELECT id FROM users WHERE id = $1', [userId]);

    if (checkUser.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: {
              'Content-Type': 'application/json'
          }
      });
    }

    await client.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3',
      [name, phone, userId]
    )
    return new Response('Profile updated', {
      status: 200,
    })
  } catch (e) {
    return new Response('Failed to update profile', {
      status: 500,
    })
  } finally {
    client.release()
  }
}