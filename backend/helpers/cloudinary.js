const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  hide_sensitive: true,
});

const uploadMediaToCloudinary = async (filePath) => {
  const hasCloudinaryConfig =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinaryConfig) {
    const error = new Error(
      "Media uploads are not configured. Set the Cloudinary credentials in server/.env."
    );
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    throw error;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", {
      code: error.code,
      httpCode: error.http_code,
      message: error.message,
    });
    throw error;
  }
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    // Try deleting as video first (since curriculum lectures are videos)
    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    if (result && result.result === "ok") {
      return result;
    }

    // Fall back to image
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", {
      code: error.code,
      httpCode: error.http_code,
      name: error.name,
      message: error.message,
    });
    throw error;
  }
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
