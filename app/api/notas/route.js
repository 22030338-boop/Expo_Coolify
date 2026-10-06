import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Obtener todas las notas
export async function GET() {
    try {
        const result = await query('SELECT * FROM notas ORDER BY id DESC;');
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Crear una nueva nota
export async function POST(request) {
    try {
        const body = await request.json();
        if (!body.titulo || body.titulo.trim() === '') {
            return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 });
        }

        const result = await query(
            'INSERT INTO notas (titulo, completada) VALUES ($1, false) RETURNING *;',
            [body.titulo.trim()]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}