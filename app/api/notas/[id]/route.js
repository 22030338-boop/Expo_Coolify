import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT: Modificar nota (título o estado completado)
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();

        const result = await query(
            `UPDATE notas 
       SET titulo = COALESCE($1, titulo), 
           completada = COALESCE($2, completada) 
       WHERE id = $3 
       RETURNING *;`,
            [body.titulo ?? null, body.completada ?? null, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Eliminar una nota
export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        const result = await query('DELETE FROM notas WHERE id = $1 RETURNING *;', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 });
        }

        return NextResponse.json({ mensaje: 'Nota eliminada', id: Number(id) });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}