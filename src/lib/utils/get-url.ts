export const getURL = (): string => {
  // Use the environment variable if set, otherwise fall back to production URL.
  // This guarantees email links NEVER point to a Vercel Preview URL.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://igame-fintech-lovat.vercel.app";

  // Ensure trailing slash
  return siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
};
