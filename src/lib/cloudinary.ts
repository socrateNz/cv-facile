import { v2 as cloudinary } from "cloudinary";

function cloudinaryConfigFromEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Supporte 2 formats:
  // 1) variables séparées
  // 2) CLOUDINARY_API_SECRET rempli par erreur avec l'URL cloudinary://...
  if (apiSecret?.startsWith("cloudinary://")) {
    try {
      const parsed = new URL(apiSecret);
      return {
        cloud_name: parsed.hostname || cloudName,
        api_key: parsed.username || apiKey,
        api_secret: parsed.password,
      };
    } catch {
      return {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      };
    }
  }

  return {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  };
}

cloudinary.config(cloudinaryConfigFromEnv());

export { cloudinary };
