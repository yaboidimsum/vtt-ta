/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/Dashboard",
        destination: "/dashboard",
      },
      {
        source: "/Dashboard/:path*",
        destination: "/dashboard/:path*",
      },
      {
        source: "/Thankyou",
        destination: "/thankyou",
      },
    ];
  },
};

export default nextConfig;
