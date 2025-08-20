/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  images: {
    remotePatterns: isDev
      ? [
          {
            protocol: "http",
            hostname: "localhost",
            port: "3000",
            pathname: "/uploads/**",
          },
        ]
      : [
          {
            protocol: "https", // use "http" if you don’t have SSL
            hostname: "buysellliberia.com", // or your server IP
            port: "", // leave empty for default 80/443
            pathname: "/uploads/**",
          },
        ],
  },
};

export default nextConfig;
