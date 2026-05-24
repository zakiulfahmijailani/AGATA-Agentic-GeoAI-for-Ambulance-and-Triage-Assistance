/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Mapbox GL JS worker
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl',
    };
    return config;
  },
};

module.exports = nextConfig;
