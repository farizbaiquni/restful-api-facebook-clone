import { Request, Response } from "express";
import { PostType } from "../types/PostType";
import addPostModel from "../models/posts";

export const addPost = async (req: Request, res: Response) => {
  const {
    user_id,
    content,
    emoji,
    activity_icon_url,
    gif_url,
    latitude,
    longitude,
    location_name,
    audience_type_id,
    media,
    audience_include,
    audience_exclude,
  } = req.body;

  if (!user_id || !content) {
    return res.status(400).json({
      error: 400,
      message: "User id or audience type id or content not found",
    });
  }

  const postData: PostType = {
    user_id: user_id,
    content: content,
    emoji: emoji,
    activity_icon_url: activity_icon_url,
    gif_url: gif_url,
    latitude: latitude,
    longitude: longitude,
    location_name: location_name,
    audience_type_id: audience_type_id,
  };

  try {
    const response = await addPostModel(
      postData,
      media,
      audience_include,
      audience_exclude
    );
    return res
      .status(200)
      .json({ status: 200, message: "Add post successful" });
  } catch (error) {
    return res.status(500).json({
      error: {
        error: "500",
        message: "Internal server error",
        details: error,
        postData: postData,
      },
    });
  }
};
