import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Evita o Next inferir um package-lock.json acima da pasta do projeto no Windows.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
