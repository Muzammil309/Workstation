/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the output: 'export' for Vercel deployment
  // Vercel handles this automatically
  
  // Keep other settings
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig