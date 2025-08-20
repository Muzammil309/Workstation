/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' for Vercel deployment
  // Vercel handles this automatically
  
  // Keep other settings
  experimental: {
    // appDir is now enabled by default in Next.js 13+
  }
}

module.exports = nextConfig