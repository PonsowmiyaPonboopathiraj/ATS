app.post("/api/pdf/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log("Uploaded file:", req.file);

        const newFile = new PDF({
            name: req.file.originalname,
            filePath: req.file.path,
        });
        await newFile.save();
        res.json({ message: "File uploaded successfully", data: newFile });
    } catch (err) {
        res.status(500).json({ error: "Failed to upload file", details: err.message });
    }
});
// Route to retrieve and download the PDF file
router.get("/api/pdf/:id", async (req, res) => {
    try {
        const file = await PDF.findById(req.params.id);
        if (!file) return res.status(404).json({ error: "File not found" });

        // Download file with original name
        res.download(file.filePath, file.name);
    } catch (err) {
        res.status(500).json({ error: "Failed to retrieve file", details: err.message });
    }
});

module.exports = router;