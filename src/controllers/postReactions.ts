import { Request, Response } from "express";
import {
  addOrUpdatePostReactionModel,
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
  ResultAffectedRows,
} from "../types/ResponsesType";
import {
  GetPostReactionType,
  GetTop3PostReactionsType,
  AddPostReactionType,
  DeletePostReactionType,
} from "../types/PostReactionsType";

// ====== Function to get top 3 post reactions ======
export const getTop3PostReactions = async (req: Request, res: Response) => {
  const requiredParams = ["postId"];

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
    const response: any[] = await getTop3PostReactionsModel(postId);
    console.log(response[0]);
    const successObject: SuccessResponseType<GetTop3PostReactionsType> = {
      status: "success",
      code: 200,
      message: "Get top 3 post reactions successful",
      data: response[0],
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to get post reaction ======
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
      data:
        response[0].length > 0 ? (response[0][0] as GetPostReactionType) : null,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to add post reaction ======
export const addOrUpdatePostReaction = async (req: Request, res: Response) => {
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
    const response: ResultAffectedRows = await addOrUpdatePostReactionModel(
      user_id,
      post_id,
      reaction_id
    );

    if (response.affectedRows === 0) {
      const errors: ErrorType[] = [
        {
          type: "not found",
          message: "resource not found",
        },
      ];
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
        code: 404,
        errors: errors,
      };
      return res.status(404).json(errorObject);
    }

    const successObject: SuccessResponseType<AddPostReactionType> = {
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

// ====== Function to delete a post reactions  ======
export const deletePostReaction = async (req: Request, res: Response) => {
  const requiredParams = ["user_id", "post_id"];

  if (!req.body.user_id || !req.body.post_id) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const { user_id, post_id } = req.body;

  try {
    const response: ResultAffectedRows = await deletePostReactionModel(
      user_id,
      post_id
    );

    if (response.affectedRows === 0) {
      const errors: ErrorType[] = [
        {
          type: "not found",
          message: "resource not found",
        },
      ];
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
        code: 404,
        errors: errors,
      };
      return res.status(404).json(errorObject);
    }

    const successObject: SuccessResponseType<DeletePostReactionType> = {
      status: "success",
      code: 200,
      message: "Delete post reaction successful",
      data: {
        user_id,
        post_id,
      },
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};
