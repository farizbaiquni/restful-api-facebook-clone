import { Request, Response } from "express";
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
  GetCommentReactionType,
  AddCommentReactionType,
  DeleteCommentReactionType,
} from "../types/CommentReactionsType";
import {
  addOrUpdateCommentReactionModel,
  deleteCommentReactionModel,
  getCommentReactionModel,
} from "../models/commentReactions";

// ====== Function to get comment reaction ======
export const getCommentReaction = async (req: Request, res: Response) => {
  const requiredParams = ["userId", "commentId"];

  if (!req.query.userId || !req.query.commentId) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const userId = Number(req.query.userId);
  const commentId = Number(req.query.commentId);

  if (isNaN(userId) || isNaN(commentId)) {
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
    const response: any[] = await getCommentReactionModel(userId, commentId);
    const successObject: SuccessResponseType<GetCommentReactionType | null> = {
      status: "success",
      code: 200,
      message: "Get coment reaction by user id successful",
      data:
        response[0].length > 0
          ? (response[0][0] as GetCommentReactionType)
          : null,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to add comment reaction ======
export const addOrUpdateCommentReaction = async (
  req: Request,
  res: Response
) => {
  const requiredParams = ["user_id", "comment_id", "reaction_id"];
  const requiredParamsAreNumber = ["user_id", "comment_id", "reaction_id"];

  if (!req.body.user_id || !req.body.comment_id || !req.body.reaction_id) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const { user_id, comment_id, reaction_id } = req.body;
  const userId = Number(user_id);
  const commentId = Number(comment_id);
  const reactionId = Number(reaction_id);

  if (isNaN(userId) || isNaN(commentId) || isNaN(reactionId)) {
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParamsAreNumber
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  try {
    const response: ResultAffectedRows = await addOrUpdateCommentReactionModel(
      userId,
      commentId,
      reactionId
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

    const successObject: SuccessResponseType<AddCommentReactionType> = {
      status: "success",
      code: 200,
      message: "Add post reaction successful",
      data: {
        user_id,
        comment_id,
        reaction_id,
      },
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// ====== Function to delete a comment reactions  ======
export const deleteCommentReaction = async (req: Request, res: Response) => {
  const requiredParams = ["user_id", "comment_id"];
  const requiredParamsAreNumber = ["user_id", "comment_id"];

  if (!req.body.user_id || !req.body.comment_id) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const { user_id, comment_id } = req.body;
  const userId = Number(user_id);
  const commentId = Number(comment_id);

  if (isNaN(userId) || isNaN(commentId)) {
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParamsAreNumber
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  try {
    const response: ResultAffectedRows = await deleteCommentReactionModel(
      user_id,
      comment_id
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

    const successObject: SuccessResponseType<DeleteCommentReactionType> = {
      status: "success",
      code: 200,
      message: "Delete post reaction successful",
      data: {
        user_id,
        comment_id,
      },
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};
