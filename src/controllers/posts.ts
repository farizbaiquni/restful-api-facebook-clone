import { Request, Response } from "express";
import { AddPostType, GetPostType } from "../types/PostType";
import { addPostModel, getPostsModel } from "../models/posts";
import {
  DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER,
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
  SuccessResponseType,
  validateParams,
  validateParamsAsNumber,
} from "../types/Responses";

export const addPost = async (req: Request, res: Response) => {
  const requiredParams = ["user_id", "audience_type_id"];
  const {
    user_id,
    content = "",
    emoji,
    activity_icon_url,
    gif_url,
    latitude,
    longitude,
    location_name,
    audience_type_id,
    media = [],
    audience_include = [],
    audience_exclude = [],
  } = req.body;

  if (!user_id || !audience_type_id) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const post: AddPostType = {
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
      post,
      media,
      audience_include,
      audience_exclude
    );
    const successObject: SuccessResponseType<AddPostType | null> = {
      status: "success",
      code: 200,
      message: "Get post reactions by user id successful",
      data: post,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const requiredParams = ["offset"];
  const limit: number = 5;

  let { offset = 0 } = req.query;
  offset = Number(offset);

  if (isNaN(offset)) {
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParams
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  try {
    const response: any[] = await getPostsModel(offset, limit);
    const successObject: SuccessResponseType<GetPostType[]> = {
      status: "success",
      code: 200,
      message: "Get posts successful",
      data: response[0] as GetPostType[],
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
