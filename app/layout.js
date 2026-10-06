export const metadata = {
    title: 'DevNotes - Práctica Coolify',
    description: 'Aplicación Full-Stack para práctica de despliegue en Coolify',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
                {children}
            </body>
        </html>
    );
}