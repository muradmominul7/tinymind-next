/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kept off for now: the classic caching model is simpler for pages that depend on
  // dynamic URLs (category/product pages). Can be revisited later.
  cacheComponents: false,

  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
};

export default nextConfig;
