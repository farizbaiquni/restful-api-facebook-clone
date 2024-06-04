import { Request, Response } from "express";
import { getProfileByIdModel } from "../models/profiles";

export const getProfileById = async (req: Request, res: Response) => {
  const userId: number = 1;
  try {
    const [results, fields] = await getProfileByIdModel(userId);
    res.json((results as any)[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: { error: "500", message: "Internal server error" } });
  }
};
