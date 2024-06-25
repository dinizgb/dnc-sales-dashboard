import { db } from '@vercel/postgres'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const client = await db.connect()

  try {
    const result = await client.query('SELECT id, password FROM users WHERE email = $1', [email])

    if (result.rows.length === 0) {
      return new Response('Invalid credentials!', {
        status: 401,
      })
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return new Response('Invalid credentials!', {
        status: 401,
      })
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '2h' })

    return new Response(JSON.stringify({ jwt_token: token }), {
      status: 200,
      headers: {
          'Content-Type': 'application/json'
      }
    })
  } catch (e) {
    return new Response(`${e}`, {
      status: 500,
    })
  } finally {
    client.release()
  }
}