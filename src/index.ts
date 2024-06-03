import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const port = 4000;

const SECRET_KEY = process.env.JWT_SECRET as string;
const DB_HOST = process.env.DB_HOST as string;
const DB_USER = process.env.DB_USER as string;
const DB_PASSWORD = process.env.DB_PASSWORD as string;
const DB_NAME = process.env.DB_NAME as string;

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      user_id: number;
      email: string;
    };
  }
}

// Create MySQL connection pool using environment variables
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(bodyParser.json());

// Register new user
app.post("/register", async (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    email,
    password,
    profile_picture,
    cover_photo,
    bio,
    birth_date,
    gender_id,
  } = req.body;

  if (!first_name || !last_name || !email || !password || !gender_id) {
    return res.status(400).json({
      error: {
        error: "400",
        message: "Please provide all required fields",
      },
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      profile_picture,
      cover_photo,
      bio,
      birth_date,
      gender_id,
    };

    const connection = await pool.getConnection();
    try {
      const SQLQuery = "INSERT INTO Users SET ?";
      await connection.query(SQLQuery, user);
      res.status(201).send("User registered");
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          error: {
            error: "400",
            message: "Email already exists",
          },
        });
      }
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({
      error: {
        error: "400",
        message: "Internal server error",
      },
    });
  }
});

// Login user
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: {
        error: "400",
        message: "Please provide email and password",
      },
    });
  }

  try {
    const connection = await pool.getConnection();
    try {
      const SQLQuery = "SELECT * FROM Users WHERE email = ?";
      const [results] = await connection.execute(SQLQuery, [email]);

      if ((results as any).length === 0) {
        return res.status(401).json({
          error: {
            error: "401",
            message: "Invalid email or password",
          },
        });
      }

      const user = (results as any)[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          error: {
            error: "401",
            message: "Invalid email or password",
          },
        });
      }

      const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        SECRET_KEY,
        { expiresIn: "7d" }
      );
      res.json({ token });
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({
      error: {
        error: "401",
        message: "Internal server error",
      },
    });
  }
});

// Middleware to authenticate requests
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      error: {
        error: "401",
        message: "Access denied",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as {
      user_id: number;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: {
        error: "401",
        message: "Invalid token",
      },
    });
  }
};

// Example of an authenticated route
app.get("/profile", authenticate, async (req: Request, res: Response) => {
  const userId = req.user!.user_id;
  try {
    const connection = await pool.getConnection();
    try {
      const SQLQuery = "SELECT * FROM Users WHERE user_id = ?";
      const [results] = await connection.execute(SQLQuery, [userId]);
      res.json((results as any)[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
      },
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
