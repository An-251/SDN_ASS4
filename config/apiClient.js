const https = require("https");

const axios = require("axios");

const apiBaseUrl =
  process.env.API_BASE_URL ||
  `http://127.0.0.1:${process.env.PORT || 3000}/api`;

const apiClient = axios.create({

  //tất cả request Axios sẽ gọi tới API base URL.
  baseURL: apiBaseUrl.replace(/\/$/, ""),
  timeout: 10000,
  httpsAgent: apiBaseUrl.startsWith("https://")
    ? new https.Agent({
        rejectUnauthorized: process.env.API_REJECT_UNAUTHORIZED !== "false",
      })
    : undefined,
});

module.exports = apiClient;
