import { Pool } from 'pg';

let pool;

if (!global._pgPool) {
    global._pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' && process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
    });
}

pool = global._pgPool;

export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return { ...res, duration };
}