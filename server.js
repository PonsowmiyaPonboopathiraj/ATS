const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDF = require("./models/pdfModel"); // Update with your actual model path
require("dotenv").config();

const app = express();
const PORT =  5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// File filter to accept only specific formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|xls|xlsx/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type! Only PDF, DOC, DOCX, PPT, PPTX, XLS, and XLSX are allowed."));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1); // Exit the process with a failure code
    }
};
connectDB();

// Upload route
app.post("/api/pdf/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("Uploaded file:", req.file); // Debugging line to check file data
        
        const newFile = new PDF({
            name: req.file.originalname,
            filePath: req.file.path,
        });
        await newFile.save();
        res.json({ message: "File uploaded successfully in the server", data: newFile });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload file", details: err.message });
    }
});

// Start server
app.get('/', (req, res) => {
    res.send('Server is running!');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
