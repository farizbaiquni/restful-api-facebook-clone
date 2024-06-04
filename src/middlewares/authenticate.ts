import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET as string;

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      user_id: number;
      email: string;
    };
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({
      error: { error: "401", message: "Access denied" },
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
    res.status(401).json({ error: { error: "401", message: "Invalid token" } });
  }
};
