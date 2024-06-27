import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, cookieName } from "../configs/config";
import {
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
} from "../types/ResponsesType";

interface ExtendedRequest extends Request {
  userId?: string;
}

type PayloadType = {
  user_id: string;
  email: string;
};

export const authVerifyTokenJWT = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[cookieName];

  if (!token) {
    const httpResponseCode = 401;
    const errors: ErrorType = {
      field: "token",
      type: "validation",
      message: "Token is missing",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: [errors],
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as PayloadType;
    req.userId = decoded.user_id;
    next();
  } catch (error) {
    const httpResponseCode = 401;
    const errors: ErrorType = {
      field: "token",
      type: "validation",
      message: "Token verification failed",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.UNAUTHORIZED_ACCESS,
      code: httpResponseCode,
      errors: [errors],
    };
    return res.status(httpResponseCode).json(errorObject);
  }
};
