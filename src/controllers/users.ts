import { Request, Response } from "express";
import { getUserByIdModel } from "../models/users";
import {
  DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER,
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
  SuccessResponseType,
} from "../types/ResponsesType";

interface ExtendedRequest extends Request {
  userId?: string;
}

export const getUserByToken = async (req: ExtendedRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    const httpResponseCode = 400;
    const errors: ErrorType = {
      field: "token",
      type: "validation",
      message: "Invalid token",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: [errors],
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const response: any[] = await getUserByIdModel(userId);
    if (response[0].length === 0) {
      const httpResponseCode = 404;
      const errors: ErrorType = {
        type: "userNotFound",
        message: "User not found",
      };
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
        code: httpResponseCode,
        errors: [errors],
      };
      return res.status(httpResponseCode).json(errorObject);
    }
    const httpResponseCode = 200;
    const successObject: SuccessResponseType<any> = {
      status: "success",
      code: httpResponseCode,
      message: "Login successful",
      data: response[0][0],
      pagination: null,
    };
    res.status(200).json(successObject);
  } catch (error) {
    res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};
