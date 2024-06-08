import { Request as ExpressRequest, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configs/config";
const cookie = require("cookie");

interface JwtPayload {
  user_id: string;
  email: string;
}

interface CustomRequest extends ExpressRequest {
  user_id?: string;
}

export const authVerifyTokenJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies["facebook-clone"];

  if (!token) {
    return res.status(400).json({ error: 400, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as JwtPayload;
    req.user_id = decoded.user_id;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: 401, message: "Token verification failed" });
  }
};
