const http = require('http');
const fs = require('fs');
const path = require('path');

const videoPath = "/Users/hunghoang/project/blogging_BE_site/uploads/videos/0eb26ba4-23df-4cea-b462-95f779f636c8_1692090069598.mp4"
const stat = fs.statSync(videoPath);

const server = http.createServer((req, res) => {
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath).pipe(res);
  } else {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunkSize = (end - start) + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });
    console.log('writing')
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  }
});

const port = 3002;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});