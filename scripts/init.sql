CREATE TABLE IF NOT EXISTS notas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notas (titulo) VALUES
('Aprender a auto-hospedar con Coolify'),
('Configurar PostgreSQL y Docker');