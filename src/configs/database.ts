import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import { ENV } from "./config";

type ConfigType = {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: string;
};

const config: ConfigType = require("../../config/config.json")[ENV];

if (!config.host || !config.username || !config.password || !config.database) {
  throw new Error("Missing required environment variables");
}

// Buat koneksi pool ke database
const pool = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

export const getConnection = async () => {
  return await pool.getConnection();
};
