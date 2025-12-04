/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Transpile prismic packages and semantic-ui-react
    transpilePackages: ['@prismicio/react', 'semantic-ui-react'],
};

export default nextConfig;
