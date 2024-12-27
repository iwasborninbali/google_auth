/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Применяем эти заголовки для всех маршрутов
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // В продакшене лучше указать конкретный домен
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  // Отключаем строгий режим для RSC
  experimental: {
    strictNextHead: false,
  },
};

export default nextConfig;
