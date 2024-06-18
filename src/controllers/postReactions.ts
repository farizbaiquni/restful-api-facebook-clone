import { Request, Response } from "express";
import {
  addPostReactionModel,
  deletePostReactionModel,
  getPostReactionsByUserIdModel,
  getTop3PostReactionsByPostIdModel,
} from "../models/postReactions";

export const getTop3PostReactionsByPostId = async (
  req: Request,
  res: Response
) => {
  if (!req.params.postId) {
    return res.status(400).json({
      error: 400,
      message: "Please provide the required postId",
    });
  }

  const postId = parseInt(req.params.postId, 10);

  if (isNaN(postId)) {
    return res.status(400).json({
      error: 400,
      message: "postId is not a number",
    });
  }

  try {
    const response = await getTop3PostReactionsByPostIdModel(postId);
    return res.status(200).json({
      status: 200,
      message: "Get top post reactions successful",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        detail: error,
      },
    });
  }
};

export const getPostReactionsByUserId = async (req: Request, res: Response) => {
  if (!req.params.userId || !req.params.postId) {
    return res.status(400).json({
      error: 400,
      message: "Please provide all required fields",
    });
  }

  const userId = parseInt(req.params.userId, 10);
  const postId = parseInt(req.params.postId, 10);

  if (isNaN(userId) || isNaN(postId)) {
    return res
      .status(400)
      .json({ error: 400, message: "userId or postId are not number" });
  }

  try {
    const response = await getPostReactionsByUserIdModel(userId, postId);
    return res.status(200).json({
      status: 200,
      message: "Get post reaction successful",
      data: response[0],
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        detail: error,
      },
    });
  }
};

export const addPostReaction = async (req: Request, res: Response) => {
  const { user_id, post_id, reaction_id } = req.body;

  if (!user_id || !post_id || !reaction_id) {
    return res.status(400).json({
      error: 400,
      message: "Please provide all required fields",
    });
  }

  try {
    const response = await addPostReactionModel(user_id, post_id, reaction_id);
    return res.status(200).json({
      status: 200,
      message: "Add post reaction successful",
      data: { user_id, post_id, reaction_id },
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        detail: error,
      },
    });
  }
};

export const deletePostReaction = async (req: Request, res: Response) => {
  const { user_id, post_id } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({
      error: 400,
      message: "Please provide all required fields",
    });
  }

  try {
    const response = await deletePostReactionModel(user_id, post_id);
    return res.status(200).json({
      status: 200,
      message: "Add post reaction successful",
      data: { user_id, post_id },
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
      },
    });
  }
};
