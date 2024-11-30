 /** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['react-plotly.js'],
    webpack: (config) => {
        config.module.rules.push({
            test: /\.json$/,
            type: 'json'
        });
        return config;
    }
}

module.exports = nextConfig