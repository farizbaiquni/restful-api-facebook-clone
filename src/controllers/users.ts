import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getConnection } from "../configs/database";
import { UserType, loginModelType } from "../types/UserType";
import { signUpModel, loginModel, getUserByIdModel } from "../models/users";
import { ENV, JWT_SECRET_KEY } from "../configs/config";
import cookie from "cookie";

interface CustomRequest extends Request {
  user_id?: string;
}

export const signUp = async (req: Request, res: Response) => {
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

  if (!birth_date || !/^\d{4}-\d{2}-\d{2}$/.test(birth_date)) {
    return res.status(400).json({
      error: { error: "400", message: "Invalid birth date format" },
    });
  }

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !gender_id ||
    !birth_date
  ) {
    return res.status(400).json({
      error: { error: "400", message: "Please provide all required fields" },
    });
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

    const [results, fields] = await signUpModel(user);

    return res.status(201).json({
      status: 201,
      message: "User registered successfully",
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: { error: "400", message: "Email already exists" } });
    }
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        details: error,
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!JWT_SECRET_KEY) {
    return res.status(500).json({
      error: { error: "500", message: "Internal server error" },
    });
  }

  if (!email || !password) {
    return res.status(400).json({
      error: { error: "400", message: "Please provide email and password" },
    });
  }

  try {
    const [results] = await loginModel(email);
    if ((results as any).length === 0) {
      return res.status(401).json({
        error: { error: "401", message: "Invalid email or password" },
      });
    }

    const user: loginModelType = (results as any)[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: { error: "401", message: "Invalid email or password" },
      });
    }

    const cookieName = "facebook-clone";
    const expiredIn = 60 * 60 * 24 * 7;
    const payload = {
      user_id: user.user_id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: expiredIn });

    const serializedCookie = cookie.serialize(cookieName, token, {
      httpOnly: true,
      path: "/",
      maxAge: expiredIn,
      secure: ENV === "development",
      sameSite: "strict",
    });

    res.setHeader("Set-Cookie", serializedCookie);

    return res.status(200).json({ status: 200, message: "Login successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: { error: "500", message: "Internal server error" } });
  }
};

export const getUserById = async (req: CustomRequest, res: Response) => {
  const id = req.user_id;

  if (!id) {
    return res
      .status(400)
      .json({ error: 400, message: "Please provide user id" });
  }
  try {
    const [results] = await getUserByIdModel(id);
    if ((results as any).length === 0) {
      return res.status(401).json({
        error: { error: "401", message: "Invalid email or password" },
      });
    }
    res.status(200).json({ status: 200, results: results });
  } catch (error) {
    console.log("Error : ", error);
    res.status(500).json({ error: 500, message: "Internal server error" });
  }
};
