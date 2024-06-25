import { db } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    const { name, email, phone, password } = await req.json()

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: {
              'Content-Type': 'application/json'
          }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const client = await db.connect()

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