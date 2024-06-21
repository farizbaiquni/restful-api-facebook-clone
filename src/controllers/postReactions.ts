import { Request, Response } from "express";
import {
  addPostReactionModel,
  deletePostReactionModel,
  getPostReactionModel,
  getTop3PostReactionsModel,
} from "../models/postReactions";
import {
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
  SuccessResponseType,
  DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER,
  validateParams,
  validateParamsAsNumber,
} from "../types/Responses";
import {
  GetPostReactionType,
  GetTop3PostReactionsType,
  AddPostReactionsType,
} from "../types/postReactionsType";

// ====== Function to get top 3 post reactions of a post ======
export const getTop3PostReactions = async (req: Request, res: Response) => {
  const requiredParams = ["postId"];

  // Validate postId is exist
  if (!req.query.postId) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const postId = parseInt(req.query.postId as string, 10);

  // Validate postId is a number
  if (isNaN(postId)) {
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
    const response = await getTop3PostReactionsModel(postId);
    const successObject: SuccessResponseType<GetTop3PostReactionsType> = {
      status: "success",
      code: 200,
      message: "Get top 3 post reactions successful",
      data: response[0] as unknown as GetTop3PostReactionsType,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to get reactions of a post by user id ======
export const getPostReaction = async (req: Request, res: Response) => {
  const requiredParams = ["userId", "postId"];

  if (!req.query.userId || !req.query.postId) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const userId = Number(req.query.userId);
  const postId = Number(req.query.postId);

  if (isNaN(userId) || isNaN(postId)) {
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
    const response: any[] = await getPostReactionModel(userId, postId);
    const successObject: SuccessResponseType<GetPostReactionType | null> = {
      status: "success",
      code: 200,
      message: "Get post reactions by user id successful",
      data: !response[0][0]
        ? null
        : (response[0][0] as unknown as GetPostReactionType),
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to get reactions of a post by user id ======
export const addPostReaction = async (req: Request, res: Response) => {
  const requiredParams = ["user_id", "post_id", "reaction_id"];

  if (!req.body.user_id || !req.body.post_id || !req.body.reaction_id) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const { user_id, post_id, reaction_id } = req.body;

  try {
    const response = await addPostReactionModel(user_id, post_id, reaction_id);
    const successObject: SuccessResponseType<AddPostReactionsType> = {
      status: "success",
      code: 200,
      message: "Add post reaction successful",
      data: {
        user_id,
        post_id,
        reaction_id,
      },
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
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
