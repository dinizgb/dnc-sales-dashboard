import { headers } from 'next/headers'
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
        const result = await client.query('SELECT * FROM users WHERE id = $1', [userId])

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const starsResponse = [
            { name: 'Marina Ruiz', value: parseFloat((Math.random() * 10000).toFixed(2)) }, 
            { name: 'João Medeiros', value: parseFloat((Math.random() * 10000).toFixed(2)) }, 
            { name: 'Fábio Manoel', value: parseFloat((Math.random() * 10000).toFixed(2)) },
            { name: 'Larissa Lima', value: parseFloat((Math.random() * 10000).toFixed(2)) }
        ];

        const sortStarsByValueDesc = (stars: any) => {
            return stars.sort((a: any, b: any) => b.value - a.value);
        };
        
        return new Response(JSON.stringify(sortStarsByValueDesc(starsResponse)), {
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