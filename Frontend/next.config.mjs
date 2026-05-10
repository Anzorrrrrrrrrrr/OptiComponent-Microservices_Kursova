/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // 1. Спочатку правило для Авторизації (AuthService)
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5247/api/auth/:path*' // Порт вашого AuthService
      },
      {
        // Всі запити, які починаються з /api/...
        source: '/api/:path*',
        // ...будуть перенаправлятися на ваш C# бекенд
        destination: 'http://localhost:7284/api/:path*' 
      }
    ]
  }
};

export default nextConfig;