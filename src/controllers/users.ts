import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getConnection } from "../configs/database";
import { UserType } from "../types/UserType";
import { signUpModel, loginModel } from "../models/users";

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

  if (!first_name || !last_name || !email || !password || !gender_id) {
    return res.status(400).json({
      error: { error: "400", message: "Please provide all required fields" },
    });
  }

  let connection;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: UserType = {
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

    connection = await getConnection();
    const [results, fields] = await signUpModel(user);
    return res.status(201).send("User registered");
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: { error: "400", message: "Email already exists" } });
    }
    return res
      .status(500)
      .json({ error: { error: "500", message: "Internal server error" } });
  }
};

export const login = async (req: Request, res: Response) => {
  const SECRET_KEY = process.env.JWT_SECRET;
  const { email, password } = req.body;

  if (!SECRET_KEY) {
    return res.status(500).json({
      error: { error: "500", message: "Secret key not found" },
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

    const user = (results as any)[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: { error: "401", message: "Invalid email or password" },
      });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ error: { error: "500", message: "Internal server error" } });
  }
};
