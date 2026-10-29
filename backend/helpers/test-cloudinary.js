const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const https = require("https");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

async function runDiagnostics() {
  console.log("\n==================================================");
  console.log("       CLOUDINARY DIAGNOSTIC TOOL");
  console.log("==================================================\n");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ MISSING CONFIGURATION:");
    console.error("   Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and");
    console.error("   CLOUDINARY_API_SECRET are set in server/.env\n");
    process.exit(1);
  }

  console.log("Configuration found in server/.env:");
  console.log(` - Cloud Name: ${cloudName}`);
  console.log(` - API Key:    ${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
  console.log(` - API Secret: ${apiSecret.slice(0, 4)}...${apiSecret.slice(-4)}\n`);

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    hide_sensitive: true,
  });

  // Step 1: Ping Cloudinary API
  console.log("Step 1: Testing Cloudinary API authentication (Ping)...");
  try {
    const pingResult = await cloudinary.api.ping();
    console.log("✅ Authentication successful! Cloudinary ping status:", pingResult.status);
  } catch (pingErr) {
    console.error("❌ Authentication failed:", pingErr.message);
    if (pingErr.http_code === 401) {
      console.error("\nReason: Invalid API Key or API Secret. Please verify your credentials in server/.env.");
    }
    process.exit(1);
  }

  // Step 2: Test Upload Permissions
  console.log("\nStep 2: Testing upload permission (actions=['create'])...");
  const timestamp = Math.floor(Date.now() / 1000);
  const strToSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

  const testPayload = JSON.stringify({
    file: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    timestamp,
    api_key: apiKey,
    signature,
  });

  const uploadResult = await new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "api.cloudinary.com",
        path: `/v1_1/${cloudName}/image/upload`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(testPayload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, headers: res.headers, data: JSON.parse(body) });
          } catch {
            resolve({ statusCode: res.statusCode, headers: res.headers, raw: body });
          }
        });
      }
    );

    req.on("error", (err) => resolve({ error: err }));
    req.write(testPayload);
    req.end();
  });

  if (uploadResult.statusCode === 200 && uploadResult.data?.public_id) {
    console.log("✅ Upload test SUCCESSFUL!");
    console.log("   Uploaded asset URL:", uploadResult.data.secure_url || uploadResult.data.url);

    // Step 3: Test Delete Permission
    console.log("\nStep 3: Cleaning up test asset (Destroy)...");
    try {
      await cloudinary.uploader.destroy(uploadResult.data.public_id, { resource_type: "image" });
      console.log("✅ Asset deleted successfully.");
    } catch (destroyErr) {
      console.warn("⚠️ Cleanup warning:", destroyErr.message);
    }

    console.log("\n==================================================");
    console.log("🎉 ALL CHECKS PASSED: Cloudinary is fully operational!");
    console.log("==================================================\n");
    process.exit(0);
  }

  // Handle Upload Failure
  console.error(`❌ Upload failed with HTTP status ${uploadResult.statusCode}:`);
  const errMsg = uploadResult.data?.error?.message || uploadResult.raw || uploadResult.error?.message;
  console.error("   Error detail:", errMsg);

  if (
    uploadResult.statusCode === 403 ||
    (errMsg && errMsg.includes("missing permissions"))
  ) {
    console.log("\n--------------------------------------------------");
    console.log("🔍 ROOT CAUSE IDENTIFIED:");
    console.log("   Your API key is valid for authentication, but it does NOT");
    console.log("   have permission to upload/create assets (missing actions=['create']).");
    console.log("--------------------------------------------------");
    console.log("\n🔧 HOW TO FIX THIS IN 1 MINUTE:");
    console.log("   1. Open Cloudinary Console: https://console.cloudinary.com/");
    console.log("   2. Go to your Dashboard (or Settings > Access Keys / API Keys).");
    console.log("   3. Option A (Recommended): Copy your Master / Primary API Key & API Secret");
    console.log("      from the Product Environment Credentials on the Dashboard.");
    console.log("      Option B: In Settings > API Keys, edit key", apiKey);
    console.log("      and assign it the 'Upload' or 'Admin' role/permissions.");
    console.log("   4. Update server/.env with the updated CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.");
    console.log("   5. Re-run this check: npm run test:cloudinary\n");
  }

  process.exit(1);
}

runDiagnostics();
