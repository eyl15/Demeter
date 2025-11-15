require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");
const GeminiService = require("./aiService");
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
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // correct bucket URL
});
const bucket = admin.storage().bucket();

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

// Initialize  AI Service
let aiService;
try {
  aiService = new GeminiService();
  console.log("AI Service initialized");
} catch (error) {
  console.warn("AI Service not initialized:", error.message);
}

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

// ---------------- Upload endpoint ----------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const { uid } = req.body;
    if (!uid) return res.status(400).send("Missing uid");

    // Determine folder automatically based on mimetype
    let folder;
    if (req.file.mimetype.startsWith("image/") || req.file.mimetype === "application/pdf") {
      folder = "images";
    } else if (req.file.mimetype === "application/json") {
      folder = "files";
    } else {
      return res.status(400).send("Unsupported file type");
    }

    // User-specific path
    const timestamp = Date.now();
    const filename = `${timestamp}-${req.file.originalname}`;

    // Allow caller to override folder via form field 'folder'. If provided,
    // construct path as <uid>/<folder>/<filename>. Otherwise fall back to
    // the default behavior: <folder>/<uid>/<filename> for backwards compat.
    let storagePath;
    if (req.body && req.body.folder) {
      // Normalize folder: convert backslashes to slashes, trim slashes,
      // and lowercase segments to produce predictable paths.
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

    // Upload to Firebase Storage
    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    // Optional: make public for testing
    await file.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    res.json({ url, name: req.file.originalname, path: storagePath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// WebSocket
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("startProcess", () => socket.emit("processComplete", "Dummy output"));
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
