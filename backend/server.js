require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const http = require("http");
const https = require("https");
const socketIo = require("socket.io");
const GeminiService = require("./aiService");
const OCRService = require("./ocrService");
const fs = require("fs");
const path = require("path");

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + WebSocket setup
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_KEY)
  ),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI Service
let aiService;
try {
  aiService = new GeminiService(process.env.GEMINI_API_KEY, admin);
  // console.log(" AI Service initialized");
} catch (error) {
  console.warn(" AI Service not initialized:", error.message);
}

// Initialize OCR Service
let ocrService;
try {
  ocrService = new OCRService("medicalDocuments");
  // console.log(" OCR Service initialized");
} catch (error) {
  console.warn(" OCR Service not initialized:", error.message);
}

// Register ElevenLabs routes
const elevenlabsRouter = require("./elevenlabs/route");
app.use("/api", elevenlabsRouter);

// ---------------- Google Places API (New) endpoint ----------------
app.post("/api/nearby-stores", async (req, res) => {
  try {
    console.log("[NEARBY-STORES] Request received");
    const { lat, lng } = req.body;
    console.log("[NEARBY-STORES] Params:", { lat, lng });

    if (!lat || !lng) {
      console.error("[NEARBY-STORES] Missing lat or lng");
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    console.log("[NEARBY-STORES] API Key present:", !!apiKey);
    if (!apiKey) {
      console.error("[NEARBY-STORES] No API key configured");
      return res
        .status(500)
        .json({ error: "Google Maps API key not configured" });
    }

    // New Places API endpoint
    const url = `https://places.googleapis.com/v1/places:searchNearby`;
    console.log("[NEARBY-STORES] Calling Google Places API (New)");

    // Request body for new Places API
    const requestBody = JSON.stringify({
      includedTypes: ["grocery_store", "supermarket"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lng),
          },
          radius: 5000.0,
        },
      },
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours,places.id",
      },
    };

    const apiRequest = https.request(url, options, (apiResponse) => {
      let data = "";

      apiResponse.on("data", (chunk) => {
        data += chunk;
      });

      apiResponse.on("end", () => {
        try {
          // console.log("[NEARBY-STORES] Google API response status:", apiResponse.statusCode);
          const parsedData = JSON.parse(data);
          // console.log("[NEARBY-STORES] Number of results:", parsedData.places?.length || 0);

          if (apiResponse.statusCode === 200 && parsedData.places) {
            // Transform new API response to match legacy format for frontend compatibility
            const transformedData = {
              status: "OK",
              results: parsedData.places.map((place) => ({
                place_id: place.id,
                name: place.displayName?.text || "Unknown Store",
                vicinity: place.formattedAddress || "",
                geometry: {
                  location: {
                    lat: place.location?.latitude || 0,
                    lng: place.location?.longitude || 0,
                  },
                },
                rating: place.rating,
                opening_hours: place.currentOpeningHours
                  ? {
                      open_now: place.currentOpeningHours.openNow,
                    }
                  : undefined,
              })),
            };

            console.log(
              "[NEARBY-STORES] Sending successful response with",
              transformedData.results.length,
              "stores"
            );
            res.json(transformedData);
          } else if (apiResponse.statusCode === 200 && !parsedData.places) {
            console.log("[NEARBY-STORES] No stores found in area");
            res.json({ status: "ZERO_RESULTS", results: [] });
          } else {
            console.error(
              "[NEARBY-STORES] Google Places API error:",
              parsedData
            );
            res
              .status(apiResponse.statusCode)
              .json({ error: parsedData.error?.message || "API error" });
          }
        } catch (parseError) {
          console.error("[NEARBY-STORES] Error parsing response:", parseError);
          console.error("[NEARBY-STORES] Raw data:", data);
          res.status(500).json({ error: "Failed to parse API response" });
        }
      });
    });

    apiRequest.on("error", (error) => {
      console.error("[NEARBY-STORES] HTTPS request error:", error);
      res.status(500).json({ error: error.message });
    });

    apiRequest.write(requestBody);
    apiRequest.end();
  } catch (error) {
    console.error("[NEARBY-STORES] Exception caught:", error);
    console.error("[NEARBY-STORES] Error message:", error.message);
    console.error("[NEARBY-STORES] Error stack:", error.stack);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- AI endpoints ----------------

// Analyze fridge image for specific user
app.post("/api/analyze-fridge", async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({ error: "AI service not available" });
    }

    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: "User ID (uid) is required" });
    }

    // List all files in images/fridge folder for this user
    const prefix = `${uid}/images/fridge/`;
    const [files] = await bucket.getFiles({ prefix });

    // Debug
    // console.log(`Found ${files.length} files with prefix: ${prefix}`);
    // console.log('Files:', files.map(f => f.name));

    if (files.length === 0) {
      return res
        .status(404)
        .json({ error: "No fridge images found for this user" });
    }

    // Sort by timeCreated to get the latest
    files.sort(
      (a, b) =>
        new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
    );
    const latestFile = files[0];

    // console.log(`Analyzing latest fridge image: ${latestFile.name}`);

    const [imageBuffer] = await latestFile.download();
    const mimeType = latestFile.metadata.contentType || "image/jpeg";
    const response = await aiService.analyzeFridgeImage(imageBuffer, mimeType);

    res.json(response);
  } catch (error) {
    console.error("Fridge analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- OCR endpoints ----------------

// OCR endpoint - Process latest image from specific folder
app.post("/api/process-ocr", async (req, res) => {
  try {
    if (!ocrService) {
      return res.status(503).json({ error: "OCR service not available" });
    }

    const { uid, configType } = req.body;

    if (!uid) {
      return res.status(400).json({ error: "User ID (uid) is required" });
    }

    const folder = "medical_report";
    const prefix = `${uid}/images/${folder}/`;
    const [files] = await bucket.getFiles({ prefix });

    if (files.length === 0) {
      return res
        .status(404)
        .json({ error: `No images found in ${folder} folder for this user` });
    }

    files.sort(
      (a, b) =>
        new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
    );
    const latestFile = files[0];

    console.log(`Processing latest image: ${latestFile.name}`);

    const [imageBuffer] = await latestFile.download();
    const service = configType ? new OCRService(configType) : ocrService;
    const result = await service.processLatestImage(uid, folder);

    res.json(result);
  } catch (error) {
    console.error("OCR processing error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Categorize ingredients based on medical report
app.post("/api/categorize-ingredients", async (req, res) => {
  try {
    if (!aiService) {
      return res.status(503).json({ error: "AI service not available" });
    }

    const { medicalReportText, ingredients, uid } = req.body;

    if (!medicalReportText) {
      return res
        .status(400)
        .json({ error: "medicalReportText is required (full_text from OCR)" });
    }

    if (!ingredients || !Array.isArray(ingredients)) {
      return res
        .status(400)
        .json({ error: "ingredients array is required (from analyze-fridge)" });
    }

    const result = await aiService.categorizeIngredients(
      medicalReportText,
      ingredients,
      uid
    );

    res.json(result);
  } catch (error) {
    console.error("Ingredient categorization error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- Upload endpoint ----------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const { uid } = req.body;
    if (!uid) return res.status(400).send("Missing uid");

    let folder;
    if (
      req.file.mimetype.startsWith("image/") ||
      req.file.mimetype === "application/pdf"
    ) {
      folder = "images";
    } else if (req.file.mimetype === "application/json") {
      folder = "files";
    } else {
      return res.status(400).send("Unsupported file type");
    }

    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname}`;

    let storagePath;
    if (req.body && req.body.folder) {
      const rawFolder = String(req.body.folder || "");
      const normalized = rawFolder
        .replace(/\\/g, "/")
        .split("/")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase())
        .join("/");

      storagePath = `${uid}/${normalized}/${filename}`;
    } else {
      storagePath = `${folder}/${uid}/${filename}`;
    }

    const file = bucket.file(storagePath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // By default return metadata about the uploaded file. If the file is a
    // JSON payload, parse and include its content in the response so the
    // client (frontend) can immediately access savedRecipeIds without a
    // subsequent GET request.
    const responsePayload = {
      url,
      name: req.file.originalname,
      path: storagePath,
    };
    if (req.file.mimetype === "application/json") {
      try {
        const text = req.file.buffer.toString("utf-8");
        responsePayload.content = JSON.parse(text);
      } catch (parseErr) {
        console.warn(
          "[UPLOAD] Failed to parse uploaded JSON content:",
          parseErr.message
        );
        responsePayload.contentError = parseErr.message;
      }
    }

    res.json(responsePayload);
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// ---------------- Fetch healthdata endpoint ----------------
app.get("/:uid/healthdata", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).send("Missing uid");

    const prefix = `${uid}/healthdata/`;
    // console.log(`[HEALTHDATA] Fetching files with prefix: ${prefix}`);

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      console.warn(`[HEALTHDATA] No files found for UID: ${uid}`);
      console.warn(`[HEALTHDATA] Checked prefix: ${prefix}`);
      return res
        .status(404)
        .json({ error: "No healthdata found", prefix, uid });
    }

    // Sort files by timestamp in filename (assuming <timestamp>-<filename>.json)
    // console.log(`[HEALTHDATA] Found ${files.length} file(s) in ${prefix}:`);
    files.forEach((f) => {
      const fileName = f.name.split("/").pop() || "";
      const timestamp = parseInt(fileName.split("-")[0] || "0");
      console.log(`  - ${f.name} (timestamp: ${timestamp})`);
    });

    const latestFile = files.sort((a, b) => {
      const aFileName = a.name.split("/").pop() || "";
      const bFileName = b.name.split("/").pop() || "";
      const aTime = parseInt(aFileName.split("-")[0] || "0");
      const bTime = parseInt(bFileName.split("-")[0] || "0");
      console.log(
        `[HEALTHDATA] Comparing ${aFileName} (${aTime}) vs ${bFileName} (${bTime})`
      );
      return bTime - aTime;
    })[0];

    // console.log(`[HEALTHDATA] Serving latest file: ${latestFile.name}`);

    const contents = await latestFile.download();
    const jsonData = JSON.parse(contents.toString("utf-8"));

    // console.log(`[HEALTHDATA] Parsed data keys:`, Object.keys(jsonData));
    // console.log(`[HEALTHDATA] firstName: ${jsonData.personalInfo.firstName}, lastName: ${jsonData.personalInfo.lastName}`);
    res.json(jsonData);
  } catch (err) {
    console.error("[HEALTHDATA] Error fetching healthdata:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch healthdata", details: err.message });
  }
});

app.get("/:uid/recipes/bookmarked/", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const prefix = `${uid}/recipes/bookmarked/`;
    console.log(`[BOOKMARKED] Fetching files with prefix: ${prefix}`);

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      console.warn(`[BOOKMARKED] No files found for UID: ${uid}`);
      return res
        .status(404)
        .json({ error: "No bookmarked recipes found", prefix, uid });
    }

    // Sort by timeCreated to get the latest
    files.sort(
      (a, b) =>
        new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated)
    );
    const latestFile = files[0];

    console.log(`[BOOKMARKED] Serving latest file: ${latestFile.name}`);

    const [content] = await latestFile.download();
    const jsonData = JSON.parse(content.toString("utf-8"));

    console.log(`[BOOKMARKED] Parsed data keys:`, Object.keys(jsonData));
    res.json(jsonData);
  } catch (err) {
    console.error("[BOOKMARKED] Error fetching bookmarked recipes:", err);
    res
      .status(500)
      .json({
        error: "Failed to fetch bookmarked recipes",
        details: err.message,
      });
  }
});

// ---------------- WebSocket ----------------
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("startProcess", () =>
    socket.emit("processComplete", "Dummy output")
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// ---------------- Recipe endpoint ----------------
app.get("/:uid/recipes/saved/:date", async (req, res) => {
  try {
    const { uid, date } = req.params;
    if (!uid || !date)
      return res.status(400).json({ error: "Missing uid or date" });

    const prefix = `${uid}/recipes/saved/${date}/`;
    console.log(`[RECIPES] Fetching saved recipes with prefix: ${prefix}`);

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      console.warn(
        `[RECIPES] No saved recipes found for UID: ${uid} on ${date}`
      );
      return res
        .status(404)
        .json({ error: "No recipes found for this date", prefix, uid, date });
    }

    const sortedFiles = files.sort((a, b) => {
      const aTime = parseInt(a.name.split("/").pop()?.split("-")[0] || "0");
      const bTime = parseInt(b.name.split("/").pop()?.split("-")[0] || "0");
      return bTime - aTime;
    });

    const recipes = await Promise.all(
      sortedFiles.map(async (f) => {
        try {
          const [content] = await f.download();
          return JSON.parse(content.toString("utf-8"));
        } catch (err) {
          console.warn(
            `[RECIPES] Failed to parse JSON for file ${f.name}:`,
            err.message
          );
          return null;
        }
      })
    );

    res.json(recipes.filter(Boolean));
  } catch (err) {
    console.error("[RECIPES] Error fetching saved recipes:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch recipes", details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
