/** @type {import('next').NextConfig} */
const getRemotePattern = (url, fallbackHostname, pathname) => {
  try {
    const parsedUrl = new URL(url || `https://${fallbackHostname}`);
    return {
      protocol: parsedUrl.protocol.slice(0, -1),
      hostname: parsedUrl.hostname,
      pathname,
    };
  } catch {
    return {
      protocol: "https",
      hostname: fallbackHostname,
      pathname,
    };
  }
};

const nextConfig = {
  images: {
    remotePatterns: [
      getRemotePattern(
        process.env.DREAMPALM_API_URL,
        "api.dreampalm.id",
        "/v1/mapir/captures/**",
      ),
      getRemotePattern(
        process.env.SUPABASE_STORAGE_URL,
        "ascfwobrlwaiumvfhzgj.supabase.co",
        "/storage/v1/object/public/**",
      ),
    ],
  },
};

export default nextConfig;
