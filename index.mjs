import express from 'express'
import cors from "cors"
const app = express()
const port = 3000
import { readdirSync, createReadStream, statSync } from 'fs'
import { pipeline } from "stream";
import { join } from 'path'
import NodeID3 from "node-id3"

app.use(cors());

app.get('/music/!', (req, res) => {
  const musicfolder = join("music")
  const musiclist = readdirSync(musicfolder)

  res.send(musiclist)
})

app.get('/music/:file', (req, res) => {
  const fileParam = req.params.file;
  const range = req.headers.range;

  const file = join("music", fileParam);
  const { size } = statSync(file);

  if (range) {
    /** Extracting Start and End value from Range Header */
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    let start = Number.parseInt(startStr, 10);
    let end = endStr ? Number.parseInt(endStr, 10) : size - 1;

    if (!Number.isNaN(start) && Number.isNaN(end)) {
      end = size - 1;
    } else if (Number.isNaN(start) && !Number.isNaN(end)) {
      start = size - end;
      end = size - 1;
    }

    // Reject malformed ranges that could not be parsed
    if (Number.isNaN(start) || Number.isNaN(end)) {
      res.writeHead(416, {
        "Content-Range": `bytes */${size}`
      });
      return res.end();
    }

    // Handle unavailable range request
    if (start >= size || end >= size) {
      // Return the 416 Range Not Satisfiable.
      res.writeHead(416, {
        "Content-Range": `bytes */${size}`
      });
      return res.end();
    }

    /** Sending Partial Content With HTTP Code 206 */
    const chunkSize = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "audio/mp3"
    });

    let readable = createReadStream(file, { start, end });
    pipeline(readable, res, err => {
      if (err) console.log(err);
    });
  } else {
    res.writeHead(200, {
      "Content-Length": size,
      "Content-Type": "audio/mp3"
    });
    let readable = createReadStream(file);
    pipeline(readable, res, err => {
      if (err) console.log(err);
    });
  }
})

app.get("/music/cover/:file", (req, res) => {
  const fileParam = req.params.file;
  const file = join("music", fileParam);
  const tags = NodeID3.read(file)
  const image = typeof tags.image === 'string' ? null : tags.image;
  if (!image || !image.imageBuffer) {
    res.sendStatus(404);
    return;
  }
  res.writeHead(200, {
    'Content-Type': image.mime,
    'Content-Length': image.imageBuffer.length
  })
  res.end(image.imageBuffer);
})

app.get("/music/info/:file", (req, res) => {
  const fileParam = req.params.file;
  const file = join("music", fileParam);
  const tags = NodeID3.read(file)
  res.send({ artist: tags.artist, title: tags.title });
})

// Static assets
app.use(express.static(join('.', 'public')))

// In production, serve built frontend from dist and SPA fallback
const distDir = join(process.cwd(), 'dist')

app.use(express.static(distDir))

app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/music')) return next()
  try {
    res.sendFile(join(distDir, 'index.html'))
  } catch (e) {
    next()
  }
})

app.listen(port, () => {
  console.log(`FakeTube listening on port ${port}`)
})

