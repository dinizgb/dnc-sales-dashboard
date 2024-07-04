import { headers } from 'next/headers';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
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

    const client = await pool.connect()

    try {
        const result = await client.query('SELECT * FROM leads WHERE user_id = $1', [userId]);
        const filteredResult = result.rows.map(({ user_id, contacted, ...rest }) => rest);
        return new Response(JSON.stringify(filteredResult), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (e) {
        return new Response(`${e}`, {
            status: 500,
        });
    } finally {
        client.release();
    }
}