const express = require("express");
const cors = require("cors");
const youtubedl = require("youtube-dl-exec");
const app = express();
const port = 3000;

// Enable CORS for a specific origin
app.use(
  cors({
    origin:
      "https://youtube2mp3-f399.vercel.app/", // Your specific origin
    methods: "GET,POST,OPTIONS,PUT,PATCH,DELETE",
    allowedHeaders: "X-Requested-With,content-type",
    credentials: true,
  }),
);

// Function to handle audio download
const downloadAudio = (url, res) => {
  return new Promise((resolve, reject) => {
    const ytdlProcess = youtubedl.exec(
      url,
      {
        extractAudio: true,
        audioFormat: "mp3",
        output: "-",
        format: "bestaudio",
      },
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    // Pipe the stdout stream to the response
    ytdlProcess.stdout.pipe(res);

    // Handle errors on the stdout stream
    ytdlProcess.stdout.on("error", (err) => {
      console.error("Error streaming the file:", err);
      reject(new Error("Error streaming the file"));
    });

    // Handle errors on the stderr stream
    ytdlProcess.stderr.on("data", (data) => {
      console.error("stderr:", data.toString());
    });

    // Handle process close event
    ytdlProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Error occurred during download");
        reject(new Error("Error occurred during download"));
      } else {
        console.log(`Completed Download: ${url}`);
        resolve();
      }
    });
  });
};

// Endpoint to download audio
app.get("/download-audio", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
  res.setHeader("Content-Type", "audio/mpeg");

  try {
    await downloadAudio(url, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
