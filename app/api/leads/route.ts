import { headers } from 'next/headers';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET() {
    const headersList = headers()
    const authorization = headersList.get('Authorization')
    const token = authorization?.split(' ')[1] || ''
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const userId = decoded.userId

    const client = await pool.connect()

    try {
        const result = await client.query('SELECT * FROM leads WHERE user_id = $1', [userId])
        Response.json(result.rows)
        return new Response(JSON.stringify(result.rows), {
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