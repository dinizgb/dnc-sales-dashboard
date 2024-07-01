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

        const generateMonthResponse = () => {
            const labels = [];
            const data = [];
            const type = 'line';
        
            for (let day = 1; day <= 30; day++) {
                const dayString = day.toString().padStart(2, '0');
                const value = parseFloat((Math.random() * 10000).toFixed(2));
                labels.push(dayString);
                data.push(value);
            }
        
            return { labels, data, type };
        };
      
        const monthResponse = generateMonthResponse();
        
        return new Response(JSON.stringify(monthResponse), {
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