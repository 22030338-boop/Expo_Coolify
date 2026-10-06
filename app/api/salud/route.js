import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const result = await query('SELECT NOW() as now, current_database() as db;');
        return NextResponse.json({
            estado: 'OK',
            mensaje: 'Conexión con PostgreSQL exitosa',
            basedatos: result.rows[0].db,
            timestamp: result.rows[0].now,
            latencia_ms: result.duration
        });
    } catch (error) {
        return NextResponse.json(
            { estado: 'ERROR', mensaje: error.message },
            { status: 500 }
        );
    }
}