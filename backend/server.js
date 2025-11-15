require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const http = require("http");
const socketIo = require("socket.io");

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// HTTP + WebSocket setup
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceKey.json")),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // correct bucket URL
});
const bucket = admin.storage().bucket();

// File upload setup
const upload = multer({ storage: multer.memoryStorage() });

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
    const storagePath = `${folder}/${uid}/${filename}`;
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
