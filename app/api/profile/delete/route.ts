import { db } from '@vercel/postgres'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function DELETE() {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  if (!authorization) return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
      status: 401,
      headers: {
          'Content-Type': 'application/json'
      }
  })

  const client = await db.connect()
  const token = authorization?.split(' ')[1] || ''
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
  const userId = decoded.userId

  try {
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
    return new Response('Profile deleted', {
      status: 200,
    })
  } catch (e) {
    return new Response(`Failed to delete profile: ${e}`, {
      status: 500,
    })
  } finally {
    client.release()
  }
}