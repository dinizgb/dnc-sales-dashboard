import { db } from '@vercel/postgres'
import { headers } from 'next/headers'
import { URL } from 'url'
import jwt from 'jsonwebtoken'

export async function DELETE(req: Request) {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  if (!authorization) return new Response(JSON.stringify({ error: 'Authorization must be provided' }), {
      status: 401,
      headers: {
          'Content-Type': 'application/json'
      }
  })

  const token = authorization?.split(' ')[1] || ''
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
  const userId = decoded.userId

  const client = await db.connect()
  const url = new URL(req.url)
  const leadId = url.searchParams.get('id')

  try {
    const leadCheckResult = await client.query('SELECT id FROM leads WHERE id = $1 AND user_id = $2', [leadId, userId]);
    
    if (leadCheckResult.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Lead not found' }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    await client.query('DELETE FROM leads WHERE id = $1 AND user_id = $2', [leadId, userId]);
    return new Response('Lead deleted', {
      status: 200,
    })
  } catch (e) {
    return new Response(`Failed to delete lead: ${e}`, {
      status: 500,
    })
  } finally {
    client.release();
  }
}