require("dotenv").config();

const fs = require("fs");
const http = require("http");
const https = require("https");

const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();

  let server;
  let protocol = "http";

  if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    server = https.createServer(
      {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      },
      app
    );
    protocol = "https";
  } else {
    server = http.createServer(app);
  }

  server.listen(port, () => {
    console.log(
      `Question Bank application is running at ${protocol}://localhost:${port}`
    );
  });
}

startServer().catch((error) => {
  console.error("Unable to start SimpleQuiz API:", error.message);
  process.exit(1);
});
