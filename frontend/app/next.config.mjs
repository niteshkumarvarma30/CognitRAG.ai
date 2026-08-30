/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    const backendHost = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendHost}/api/:path*`,
      },
    ]
  },

};


export default nextConfig;
