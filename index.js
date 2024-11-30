const express = require("express");
const cors = require("cors");
const youtubedl = require("youtube-dl-exec");
const app = express();
const port = 3000;

// Enable CORS for a specific origin
app.use(cors({
  origin: 'https://56d61cd0-79dd-4bcf-83dc-bfcbd6bb2cf2-00-20yynff6e3ec2.sisko.replit.dev', // Replace with your specific origin
  methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
  allowedHeaders: 'X-Requested-With,content-type',
  credentials: true
}));

app.get("/download-audio", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send("URL is required");
  }

  res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
  res.setHeader("Content-Type", "audio/mpeg");

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

  ytdlProcess.stdout.pipe(res);

  ytdlProcess.on("close", (code) => {
    if (code !== 0) {
      console.error("Error occurred during download");
      if (!res.headersSent) {
        return res.status(500).send("Error occurred during download");
      }
    }
    console.log(`Completed Download: ${url}`);
  });

  ytdlProcess.stderr.on("data", (data) => {
    console.error("stderr:", data.toString());
    if (!res.headersSent) {
      res.status(500).send("Error occurred during download");
    }
  });

  ytdlProcess.stdout.on("error", (err) => {
    console.error("Error streaming the file:", err);
    if (!res.headersSent) {
      res.status(500).send("Error streaming the file");
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
