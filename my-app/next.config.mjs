/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },
  // Отключаем статическую генерацию для страниц с useSearchParams
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
