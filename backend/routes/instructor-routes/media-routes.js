const express = require("express");
const fsPromises = require("fs/promises");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
} = require("../../helpers/cloudinary");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const authorizeStaff = require("../../middleware/staff-middleware");

const router = express.Router();
router.use(authenticateMiddleware, authorizeStaff);

const uploadDirectory = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({ dest: uploadDirectory });

function handleMulterErrors(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "The selected file is too large to upload."
              : "The selected file could not be processed. Check the file and try again.",
        });
      }

      return next(error);
    });
  };
}

function getUploadErrorResponse(error) {
  if (error.code === "CLOUDINARY_NOT_CONFIGURED") {
    return {
      statusCode: 503,
      message: error.message,
    };
  }

  const errorMessage = String(error.message || "").toLowerCase();
  const httpCode = Number(error.http_code);
  const isCredentialError =
    httpCode === 401 ||
    /invalid (api key|signature|cloud name)|unauthorized/.test(errorMessage);

  if (isCredentialError) {
    return {
      statusCode: 502,
      message:
        "Cloudinary could not authorize this request. Verify that CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET belong to the configured cloud in server/.env.",
    };
  }

  if (httpCode === 403 || errorMessage.includes("403") || errorMessage.includes("missing permissions")) {
    return {
      statusCode: 502,
      message:
        "Cloudinary upload rejected (403 Forbidden: Missing 'create' permissions). Your API key lacks upload/create permissions. In Cloudinary Console, grant 'create' permissions to this key (Settings > API Keys) or use your primary Master API Key & Secret.",
    };
  }

  if (
    ["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"].includes(
      error.code
    )
  ) {
    return {
      statusCode: 503,
      message:
        "The server could not connect to Cloudinary. Check the server's network connection and try again.",
    };
  }

  if (httpCode === 400 || /unsupported|invalid file|file size/.test(errorMessage)) {
    return {
      statusCode: 400,
      message:
        "Cloudinary rejected this file. Check that its format and size are supported by your Cloudinary account.",
    };
  }

  return {
    statusCode: 502,
    message: error.message ||
      "Cloudinary could not complete the upload. Check the server logs and Cloudinary account status.",
  };
}

router.post("/upload", handleMulterErrors(upload.single("file")), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Choose a file to upload.",
    });
  }

  let cloudinaryResult = null;

  try {
    cloudinaryResult = await uploadMediaToCloudinary(req.file.path);
  } catch (cldError) {
    console.warn("Cloudinary upload failed, falling back to local server storage:", cldError.message);
  }

  if (cloudinaryResult) {
    await fsPromises.unlink(req.file.path).catch(() => {});
    return res.status(200).json({
      success: true,
      data: {
        url: cloudinaryResult.secure_url || cloudinaryResult.url,
        secure_url: cloudinaryResult.secure_url || cloudinaryResult.url,
        public_id: cloudinaryResult.public_id,
        storage: "cloudinary",
      },
    });
  }

  // Cloudinary fallback: Save to local server /uploads directory
  try {
    const ext = path.extname(req.file.originalname) || (req.file.mimetype?.includes("image") ? ".jpg" : ".mp4");
    const uniqueName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const destinationPath = path.join(uploadDirectory, uniqueName);

    await fsPromises.rename(req.file.path, destinationPath);

    const protocol = req.protocol || "http";
    const host = req.get("host") || "localhost:5000";
    const fileUrl = `${protocol}://${host}/uploads/${uniqueName}`;

    return res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        secure_url: fileUrl,
        public_id: `local_${uniqueName}`,
        storage: "local",
      },
      message: "Uploaded to local storage (Cloudinary credentials lack upload permissions).",
    });
  } catch (localErr) {
    console.error("Local storage fallback failed:", localErr);
    await fsPromises.unlink(req.file.path).catch(() => {});
    return res.status(500).json({
      success: false,
      message: "Failed to save upload locally.",
    });
  }
});

router.delete("/delete/:id(*)", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Asset Id is required",
      });
    }

    if (id.startsWith("local_")) {
      const filename = id.replace(/^local_/, "");
      const filePath = path.join(uploadDirectory, filename);
      await fsPromises.unlink(filePath).catch((err) => {
        if (err.code !== "ENOENT") console.error("Error deleting local file:", err);
      });
      return res.status(200).json({
        success: true,
        message: "Asset deleted successfully from local storage",
      });
    }

    await deleteMediaFromCloudinary(id);

    res.status(200).json({
      success: true,
      message: "Asset deleted successfully from cloudinary",
    });
  } catch (e) {
    const failure = getUploadErrorResponse(e);
    console.error("Media delete request failed:", {
      code: e.code,
      httpCode: e.http_code,
      name: e.name,
      message: e.message,
    });
    res.status(failure.statusCode).json({
      success: false,
      message: failure.message,
    });
  }
});

router.post("/bulk-upload", handleMulterErrors(upload.array("files", 10)), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({
      success: false,
      message: "Choose one or more files to upload.",
    });
  }

  const results = [];
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:5000";

  for (const fileItem of req.files) {
    let uploadedItem = null;

    try {
      const cldRes = await uploadMediaToCloudinary(fileItem.path);
      await fsPromises.unlink(fileItem.path).catch(() => {});
      uploadedItem = {
        url: cldRes.secure_url || cldRes.url,
        secure_url: cldRes.secure_url || cldRes.url,
        public_id: cldRes.public_id,
        storage: "cloudinary",
      };
    } catch (cldErr) {
      console.warn("Cloudinary bulk upload failed, falling back to local server storage:", cldErr.message);
      try {
        const ext = path.extname(fileItem.originalname) || ".mp4";
        const uniqueName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
        const destinationPath = path.join(uploadDirectory, uniqueName);
        await fsPromises.rename(fileItem.path, destinationPath);
        const fileUrl = `${protocol}://${host}/uploads/${uniqueName}`;
        uploadedItem = {
          url: fileUrl,
          secure_url: fileUrl,
          public_id: `local_${uniqueName}`,
          storage: "local",
        };
      } catch (localErr) {
        console.error("Local storage fallback item failed:", localErr);
        await fsPromises.unlink(fileItem.path).catch(() => {});
      }
    }

    if (uploadedItem) {
      results.push(uploadedItem);
    }
  }

  if (results.length === 0) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload any of the selected files.",
    });
  }

  res.status(200).json({
    success: true,
    data: results,
  });
});

module.exports = router;
