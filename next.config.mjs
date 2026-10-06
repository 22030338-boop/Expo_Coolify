/** @type {import('next').NextConfig} */
const nextConfig = {
    // standalone permite empaquetar la app de manera óptima para contenedores Docker
    output: "standalone",
};

export default nextConfig;