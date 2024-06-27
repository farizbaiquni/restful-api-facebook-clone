import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET_KEY } from "../configs/config";
import { UserType, loginModelType } from "../types/UserType";
import { loginModel, registerModel } from "../models/auths";
import {
  validateDateOfBirthFormat,
  validateEmailFormat,
} from "../utils/validations";
import {
  DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER,
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
  SuccessResponseType,
  validateParams,
  validateParamsAsNumber,
} from "../types/ResponsesType";

export const register = async (req: Request, res: Response) => {
  const requiredParams = [
    "first_name",
    "last_name",
    "email",
    "password",
    "birth_date",
    "gender_id",
  ];
  const requiredParamsAreNumber = ["gender_id"];

  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.gender_id ||
    !req.body.birth_date
  ) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const {
    first_name,
    last_name,
    email,
    password,
    profile_picture = null,
    cover_photo = null,
    bio = null,
    birth_date,
  } = req.body;

  let { gender_id } = req.body;

  if (!validateEmailFormat(email)) {
    const httpResponseCode = 400;
    const error: ErrorType = {
      field: "email",
      type: "validation",
      message: "Invalid email format",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: [error],
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  if (!validateDateOfBirthFormat(birth_date)) {
    const httpResponseCode = 400;
    const error: ErrorType = {
      field: "birth_date",
      type: "validation",
      message: "Invalid birth date format",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: [error],
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  gender_id = Number(gender_id);

  if (isNaN(gender_id)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParamsAreNumber
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user: UserType = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
      salt: salt,
      profile_picture,
      cover_photo,
      bio,
      birth_date,
      gender_id,
    };

    const response = await registerModel(user);

    const successObject: SuccessResponseType<null> = {
      status: "success",
      code: 201,
      message: "Create user successful",
      data: null,
      pagination: null,
    };

    return res.status(201).json(successObject);
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      const httpResponseCode = 409;
      const errors: ErrorType = {
        field: "email",
        type: "validation",
        message: "Email already exists",
      };
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.CONFLICT_DUPLICATE_ENTRY,
        code: httpResponseCode,
        errors: [errors],
      };
      return res.status(httpResponseCode).json(errorObject);
    }
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

export const login = async (req: Request, res: Response) => {
  const requiredParams = ["email", "password"];
  if (!JWT_SECRET_KEY) {
    const httpResponseCode = 500;
    const errors: ErrorType = {
      field: "jwt_secret_key",
      type: "validation",
      message: "Please provide jwt_secret_key in .env file",
    };
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INTERNAL_SERVER_ERROR,
      code: httpResponseCode,
      errors: [errors],
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  if (!req.body.email || !req.body.password) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  const { email, password } = req.body;

  try {
    const response: any[] = await loginModel(email);

    if (response[0].length === 0) {
      const httpResponseCode = 401;
      const errors: ErrorType = {
        field: "credentials",
        type: "validation",
        message: "Login credentials are incorrect",
      };
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.INVALID_PARAMETER,
        code: httpResponseCode,
        errors: [errors],
      };
      return res.status(httpResponseCode).json(errorObject);
    }

    const user: loginModelType = response[0][0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const httpResponseCode = 401;
      const errors: ErrorType = {
        field: "credentials",
        type: "validation",
        message: "Login credentials are incorrect",
      };
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.INVALID_PARAMETER,
        code: httpResponseCode,
        errors: [errors],
      };
      return res.status(httpResponseCode).json(errorObject);
    }

    const expiredIn = 60 * 60 * 24 * 7;
    const payload = {
      user_id: user.user_id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: expiredIn });

    const httpResponseCode = 200;
    const successObject: SuccessResponseType<any> = {
      status: "success",
      code: httpResponseCode,
      message: "Login successful",
      data: { token: token, expiredIn: expiredIn },
      pagination: null,
    };

    return res.status(httpResponseCode).json(successObject);
  } catch (error) {
    res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};
