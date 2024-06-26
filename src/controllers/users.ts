import { Request, Response } from "express";
import { getUserByIdModel } from "../models/users";

interface CustomRequest extends Request {
  user_id?: string;
}

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
