'use client';
import { useState, useEffect } from 'react';

export default function Home() {
    const [notas, setNotas] = useState([]);
    const [nuevoTitulo, setNuevoTitulo] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const registrarLog = (metodo, ruta, status, duracion, reqData, resData) => {
        const nuevoLog = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            metodo,
            ruta,
            status,
            duracion,
            reqData,
            resData,
        };
        setLogs((prev) => [nuevoLog, ...prev.slice(0, 19)]); // Guardar los últimos 20 logs
    };

    const ejecutarPeticion = async (metodo, url, body = null) => {
        const inicio = performance.now();
        try {
            const opciones = {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
            };
            if (body) opciones.body = JSON.stringify(body);

            const res = await fetch(url, opciones);
            const data = await res.json();
            const fin = performance.now();

            registrarLog(metodo, url, res.status, Math.round(fin - inicio), body, data);
            return data;
        } catch (err) {
            const fin = performance.now();
            registrarLog(metodo, url, 500, Math.round(fin - inicio), body, { error: err.message });
            return null;
        }
    };

    const cargarNotas = async () => {
        setLoading(true);
        const data = await ejecutarPeticion('GET', '/api/notas');
        if (Array.isArray(data)) setNotas(data);
        setLoading(false);
    };

    useEffect(() => {
        cargarNotas();
    }, []);

    const agregarNota = async (e) => {
        e.preventDefault();
        if (!nuevoTitulo.trim()) return;
        const creada = await ejecutarPeticion('POST', '/api/notas', { titulo: nuevoTitulo });
        if (creada && creada.id) {
            setNuevoTitulo('');
            cargarNotas();
        }
    };

    const toggleNota = async (nota) => {
        await ejecutarPeticion('PUT', `/api/notas/${nota.id}`, { completada: !nota.completada });
        cargarNotas();
    };

    const eliminarNota = async (id) => {
        await ejecutarPeticion('DELETE', `/api/notas/${id}`);
        cargarNotas();
    };

    return (
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            {/* Título de la práctica (aquí cambiarán el nombre en el paso de branch) */}
            <header style={{ borderBottom: '1px solid #334155', paddingBottom: '1rem', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#38bdf8', margin: 0 }}>
                    Práctica Coolify - DevNotes
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                    Plataforma de despliegue auto-hospedado (PaaS) con PostgreSQL nativo
                </p>
            </header>

            {/* Formulario de nueva nota */}
            <section style={{ background: '#1e293b', padding: '1.2rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <form onSubmit={agregarNota} style={{ display: 'flex', gap: '0.8rem' }}>
                    <input
                        type="text"
                        placeholder="Escribe una nueva nota o tarea..."
                        value={nuevoTitulo}
                        onChange={(e) => setNuevoTitulo(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.7rem',
                            borderRadius: '6px',
                            border: '1px solid #475569',
                            background: '#0f172a',
                            color: '#f8fafc',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 1.2rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Agregar
                    </button>
                </form>
            </section>

            {/* Lista de notas */}
            <section style={{ background: '#1e293b', padding: '1.2rem', borderRadius: '8px', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', marginTop: 0, color: '#e2e8f0' }}>Lista de Tareas / Notas</h2>
                {loading && <p style={{ color: '#94a3b8' }}>Cargando registros...</p>}
                {!loading && notas.length === 0 && (
                    <p style={{ color: '#64748b' }}>No hay notas registradas. Crea una arriba.</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notas.map((nota) => (
                        <div
                            key={nota.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.7rem',
                                backgroundColor: '#0f172a',
                                borderRadius: '6px',
                                border: '1px solid #334155',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                <input
                                    type="checkbox"
                                    checked={nota.completada}
                                    onChange={() => toggleNota(nota)}
                                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                />
                                <span style={{ textDecoration: nota.completada ? 'line-through' : 'none', color: nota.completada ? '#64748b' : '#f8fafc' }}>
                                    {nota.titulo}
                                </span>
                            </div>
                            <button
                                onClick={() => eliminarNota(nota.id)}
                                style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.6rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                }}
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Consola de Peticiones HTTP en tiempo real */}
            <section style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <h3 style={{ fontSize: '1rem', color: '#a855f7', margin: 0 }}>Consola de Peticiones HTTP</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Últimas operaciones realizadas</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            style={{
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                backgroundColor: '#0f172a',
                                borderLeft: `4px solid ${log.status < 300 ? '#22c55e' : '#ef4444'}`,
                            }}
                        >
                            <div style={{ display: 'flex', gap: '0.8rem', color: '#94a3b8' }}>
                                <span>[{log.timestamp}]</span>
                                <strong style={{ color: '#38bdf8' }}>{log.metodo}</strong>
                                <span>{log.ruta}</span>
                                <span style={{ color: log.status < 300 ? '#4ade80' : '#f87171' }}>{log.status}</span>
                                <span>({log.duracion}ms)</span>
                            </div>
                            <pre style={{ margin: '0.3rem 0 0 0', color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(log.resData)}
                            </pre>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}