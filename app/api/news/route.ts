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

        const newsResponse = [
            { title: 'A Importância dos Asserts e Expects em Testes Automatizados', date: '13:25', link: 'https://www.escoladnc.com.br/blog/a-importancia-dos-asserts-e-expects-em-testes-automatizados/' }, 
            { title: 'Como Criar Protótipos de Alta Fidelidade no WhatsApp', date: '12:15', link: 'https://www.escoladnc.com.br/blog/como-criar-prototipos-de-alta-fidelidade-no-whatsapp/' },
            { title: 'Evolução do Design: Do Gradiente ao Flat Design', date: '11:31', link: 'https://www.escoladnc.com.br/blog/evolucao-do-design-do-gradiente-ao-flat-design/' },
            { title: 'Prototipagem no Figma e Desenvolvimento Front-End: Guia Completo', date: '11:03', link: 'https://www.escoladnc.com.br/blog/prototipagem-no-figma-e-desenvolvimento-frontend-guia-completo/' },
            { title: 'Construção de Páginas Web: Conceitos e Boas Práticas', date: '10:43', link: 'https://www.escoladnc.com.br/blog/construcao-de-paginas-web-conceitos-e-boas-praticas/' },
            { title: 'Dominando Listas e Funções Nativas em Python', date: '10:32', link: 'https://www.escoladnc.com.br/blog/dominando-listas-e-funcoes-nativas-em-python/' },
        ];
        
        return new Response(JSON.stringify(newsResponse), {
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