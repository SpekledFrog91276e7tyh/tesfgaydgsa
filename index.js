const express = require('express');
const youtubedl = require('youtube-dl-exec');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/download-audio', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    const ytdlProcess = youtubedl.exec(
      url,
      {
        extractAudio: true,
        audioFormat: 'mp3',
        output: '-', // Stream directly to the response
      },
      { stdio: ['ignore', 'pipe', 'pipe'] } // Capture only the stdout and stderr
    );

    ytdlProcess.stdout.pipe(res);

    ytdlProcess.on('close', (code) => {
      if (code === 0) {
        // Get the video title
        youtubedl(url, { getTitle: true }).then((output) => {
          console.log(`Completed Download: ${output}`);
        }).catch((err) => {
          console.error('Error getting video title:', err);
        });
      } else {
        console.error('Error occurred during download');
        res.status(500).send('Error occurred during download');
      }
    });

    ytdlProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ytdlProcess.stdout.on('error', (err) => {
      console.error('Error streaming the file:', err);
      res.status(500).send('Error streaming the file');
    });

  } catch (error) {
    console.error('Error downloading video:', error);
    res.status(500).send('Error downloading video');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
