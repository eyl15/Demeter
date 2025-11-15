require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const http = require("http");
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
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_KEY)),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI Service
let aiService;
try {
  aiService = new GeminiService();
  console.log(" AI Service initialized");
} catch (error) {
  console.warn(" AI Service not initialized:", error.message);
}

// Initialize OCR Service
let ocrService;
try {
  ocrService = new OCRService("medicalDocuments");
  console.log(" OCR Service initialized");
} catch (error) {
  console.warn(" OCR Service not initialized:", error.message);
}

// Register ElevenLabs routes
const elevenlabsRouter = require('./elevenlabs/route');
app.use('/api', elevenlabsRouter);

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
      return res.status(404).json({ error: "No fridge images found for this user" });
    }

    // Sort by timeCreated to get the latest
    files.sort((a, b) => new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated));
    const latestFile = files[0];

    // console.log(`Analyzing latest fridge image: ${latestFile.name}`);

    const [imageBuffer] = await latestFile.download();
    const mimeType = latestFile.metadata.contentType || 'image/jpeg';
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
      return res.status(404).json({ error: `No images found in ${folder} folder for this user` });
    }

    files.sort((a, b) => new Date(b.metadata.timeCreated) - new Date(a.metadata.timeCreated));
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

// ---------------- Upload endpoint ----------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const { uid } = req.body;
    if (!uid) return res.status(400).send("Missing uid");

    let folder;
    if (req.file.mimetype.startsWith("image/") || req.file.mimetype === "application/pdf") {
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
    res.json({ url, name: req.file.originalname, path: storagePath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// ---------------- Fetch healthdata endpoint ----------------
app.get("/healthdata/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) return res.status(400).send("Missing uid");

    const prefix = `${uid}/healthdata/`;
    console.log(`[HEALTHDATA] Fetching files with prefix: ${prefix}`);

    const [files] = await bucket.getFiles({ prefix });

    if (!files || files.length === 0) {
      console.warn(`[HEALTHDATA] No files found for UID: ${uid}`);
      console.warn(`[HEALTHDATA] Checked prefix: ${prefix}`);
      return res.status(404).json({ error: "No healthdata found", prefix, uid });
    }

    // Sort files by timestamp in filename (assuming <timestamp>-<filename>.json)
    console.log(`[HEALTHDATA] Found ${files.length} file(s) in ${prefix}:`);
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
      console.log(`[HEALTHDATA] Comparing ${aFileName} (${aTime}) vs ${bFileName} (${bTime})`);
      return bTime - aTime;
    })[0];

    console.log(`[HEALTHDATA] Serving latest file: ${latestFile.name}`);

    const contents = await latestFile.download();
    const jsonData = JSON.parse(contents.toString("utf-8"));

    console.log(`[HEALTHDATA] Parsed data keys:`, Object.keys(jsonData));
    console.log(`[HEALTHDATA] firstName: ${jsonData.personalInfo.firstName}, lastName: ${jsonData.personalInfo.lastName}`);
    res.json(jsonData);
  } catch (err) {
    console.error("[HEALTHDATA] Error fetching healthdata:", err);
    res.status(500).json({ error: "Failed to fetch healthdata", details: err.message });
  }
});

// ---------------- WebSocket ----------------
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("startProcess", () => socket.emit("processComplete", "Dummy output"));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
