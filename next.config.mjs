/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/job-board-app-kursova', // Вказуємо назву репозиторію для GitHub Pages
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
