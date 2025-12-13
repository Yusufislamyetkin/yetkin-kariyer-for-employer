/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const fs = require('fs');
      const path = require('path');
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.afterEmit.tap('EnsureDashboardClientRefManifest', () => {
            try {
              const target = path.join(
                compiler.options.output.path,
                'app',
                '(dashboard)',
                'page_client-reference-manifest.js'
              );
              fs.mkdirSync(path.dirname(target), { recursive: true });
              if (!fs.existsSync(target)) {
                fs.writeFileSync(target, '{}');
              }
            } catch (err) {
              console.warn('Could not ensure dashboard client manifest:', err);
            }
          });
        },
      });
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
