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

    const client = await db.connect()

    try {
        const emailCheckResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (emailCheckResult.rows.length > 0) {
            return new Response(JSON.stringify({ error: 'Email is already in use' }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            'INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, phone, hashedPassword]
        );

        const userId = result.rows[0].id;

        return new Response(JSON.stringify({ id: userId }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        return new Response('Failed to create user', {
            status: 500,
        })
    } finally {
        client.release();
    }
}
