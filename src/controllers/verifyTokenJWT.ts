import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../configs/config";

export const verifyTokenJWT = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 400, message: "Token is missing" });
  }

  try {
    const decode = jwt.verify(token, JWT_SECRET_KEY);
    res
      .status(200)
      .json({ status: 200, message: "Token is valid", decode: decode });
  } catch (error) {
    res.status(401).json({ error: 401, message: "Token verification failed" });
  }
};
