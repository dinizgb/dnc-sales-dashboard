import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const client = await pool.connect()

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

    return new Response(JSON.stringify(token), {
      status: 200,
      headers: {
          'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    return new Response('Error', {
      status: 500,
    })
  } finally {
    client.release()
  }
}