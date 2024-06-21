import { Request, Response } from "express";
import { CommentTableType, GetCommentsType } from "../types/CommentType";
import { addCommentModel, getCommentsByPostIdModel } from "../models/comments";

export const addComment = async (req: Request, res: Response) => {
  const {
    user_id,
    post_id,
    parent_comment_id,
    content = "",
    media_type_id,
    media_url,
  } = req.body;

  if (!user_id || !post_id) {
    return res.status(400).json({
      error: 400,
      message: "User id or post id not found",
    });
  }

  const comment: CommentTableType = {
    post_id: post_id,
    parent_comment_id: parent_comment_id,
    user_id: user_id,
    content: content,
  };

  try {
    const response = await addCommentModel(comment, media_type_id, media_url);
    return res
      .status(200)
      .json({ status: 200, message: "Add comment successful", data: response });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        details: error,
      },
    });
  }
};

export const getCommentsByPostId = async (req: Request, res: Response) => {
  if (!req.query.postId) {
    return res.status(400).json({
      error: 400,
      status: "invalid_parameter",
      message: "Please provide the required postId",
    });
  }

  const postId = Number(req.query.postId);
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);

  if (isNaN(limit) || isNaN(offset) || isNaN(postId)) {
    return res.status(400).json({
      error: 400,
      status: "invalid_parameter",
      message: "Paramater is not a number",
    });
  }

  try {
    const response = await getCommentsByPostIdModel(postId, limit, offset);
    const results: any[] = response[0];

    let nextCommentId: number | null = null;

    if (results.length > limit) {
      nextCommentId = results[results.length - 1].comment_id;
      results.pop();
    }

    return res.status(200).json({
      status: 200,
      message: "Get comments successful",
      data: { result: results, next: nextCommentId },
    });
  } catch (error) {
    console.log("ERROR");
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        detail: error,
      },
    });
  }
};
