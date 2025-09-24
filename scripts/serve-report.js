const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const REPORT_DIR = "allure-report";

const server = http.createServer((req, res) => {
  let filePath = path.join(
    REPORT_DIR,
    req.url === "/" ? "index.html" : req.url
  );

  console.log(`Serving: ${filePath}`);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("File not found: " + filePath);
      } else {
        res.writeHead(500);
        res.end("Server error: " + err.message);
      }
      return;
    }

    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentTypes = {
      ".html": "text/html",
      ".json": "application/json",
      ".css": "text/css",
      ".js": "application/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
    };

    const contentType = contentTypes[ext] || "text/plain";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Allure Report Server running at http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n Shutting down server...");
  server.close(() => {
    console.log(" Server stopped");
    process.exit(0);
  });
});
