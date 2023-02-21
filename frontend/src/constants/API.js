import axios from "axios";
const http = require('http');
const https = require('https');

const baseURL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL,
  timeout: 480000,
  headers: {
  },
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  //follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,

  //cap the maximum content length we'll accept to 50MBs, just in case
  maxContentLength: 50 * 1000 * 1000
});
