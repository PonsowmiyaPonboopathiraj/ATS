const express = require("express");
const multer = require("multer");
const PDF = require("../models/pdfModel");
const router = express.Router();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// Upload PDF Route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const newPDF = new PDF({
            name: req.file.originalname,
            filePath: req.file.path,
        });
        await newPDF.save();
        res.json({ message: "PDF uploaded successfully", data: newPDF });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload PDF" });
    }
});

module.exports = router;
