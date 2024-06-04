import * as dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

// Pastikan variabel lingkungan diambil sebagai string
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Missing required environment variables");
}

// Buat koneksi pool ke database
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const getConnection = async () => {
  return await pool.getConnection();
};
