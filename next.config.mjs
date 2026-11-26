/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kept off for now: the classic caching model is simpler for pages that depend on
  // dynamic URLs (category/product pages). Can be revisited later.
  cacheComponents: false,

  // "/" is handled by src/app/page.js, which sends the visitor to the default language
  // of the Bagisto channel. (It used to be a fixed redirect to /en here.)
};

export default nextConfig;
