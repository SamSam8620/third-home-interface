// Minimal static file server for the clone. Usage: node serve.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.argv[2] ? Number(process.argv[2]) : 8199;
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";
    const filePath = path.join(root, urlPath);
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = types[ext] || "application/octet-stream";
      const range = req.headers.range;
      const match = range && /bytes=(\d*)-(\d*)/.exec(range);
      if (match) {
        const total = data.length;
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2] ? parseInt(match[2], 10) : total - 1;
        const chunk = data.slice(start, end + 1);
        res.writeHead(206, {
          "Content-Type": contentType,
          "Content-Length": chunk.length,
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Accept-Ranges": "bytes",
        });
        return res.end(chunk);
      }
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": data.length,
        "Accept-Ranges": "bytes",
      });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Clone serving at http://localhost:${port}/`));
