import type { NextConfig } from "next";
const config: NextConfig = { poweredByHeader: false, images: { remotePatterns: [{ protocol: "https", hostname: "**.cloudinary.com" }] } };
export default config;
