import { Request, Response } from "express";
import {
  AddCommentType,
  DeleteCommentType,
  GetCommentType,
  UpdateCommentType,
} from "../types/CommentType";
import {
  addCommentModel,
  deleteCommentModel,
  getCommentsByPostIdModel,
  getInitialCommentModel,
  updateCommentModel,
} from "../models/comments";
import {
  DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER,
  ErrorResponseType,
  ErrorStatusEnum,
  ErrorType,
  Pagination,
  SuccessResponseType,
  validateParams,
  validateParamsAsNumber,
} from "../types/Responses";

// Function to add comment to post
export const addComment = async (req: Request, res: Response) => {
  const requiredParams = ["user_id", "post_id"];

  if (!req.body.user_id || !req.body.post_id) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const {
    user_id,
    post_id,
    parent_comment_id = null,
    content = "",
    media_type_id = null,
    media_url = null,
  } = req.body;

  const userId = Number(user_id);
  const postId = Number(post_id);

  if ((media_type_id === null || media_url === null) && content.length <= 0) {
    const errors: ErrorType[] = [
      {
        field: "content, media_type_id, media_url",
        type: "validate",
        message: "There is no content or media attached",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

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

  const comment: AddCommentType = {
    post_id: postId,
    parent_comment_id: parent_comment_id,
    user_id: userId,
    content: content,
  };

  try {
    const response: any = await addCommentModel(
      comment,
      media_type_id,
      media_url
    );
    const successObject: SuccessResponseType<GetCommentType> = {
      status: "success",
      code: 200,
      message: "Add post successful",
      data: response[0][0],
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const getInitialComment = async (req: Request, res: Response) => {
  const requiredParams = ["postId", "userId"];
  const requiredParamsAreNumber = ["postId", "userId"];

  if (!req.query.postId && !req.query.user_id) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const postId = Number(req.query.postId);
  const userId = Number(req.query.userId);

  if (isNaN(postId) || isNaN(userId)) {
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
    const response: any[] = await getInitialCommentModel(postId, userId);

    const comments: GetCommentType[] = response[0];

    const successObject: SuccessResponseType<GetCommentType[]> = {
      status: "success",
      code: 200,
      message: "get comments successful",
      data: comments,
      pagination: null,
    };

    return res.status(200).json(successObject);
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

// Function to get comments by post id
export const getCommentsByPostId = async (req: Request, res: Response) => {
  const requiredParams = ["postId", "userId"];
  const requiredParamsAreNumber = ["postId", "userId", "offset", "limit"];

  if (!req.query.postId && !req.query.user_id) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  let { offset = 0, limit = 5 } = req.query;

  const postId = Number(req.query.postId);
  const userId = Number(req.query.userId);
  offset = Number(offset);
  limit = Number(limit);

  if (isNaN(postId) || isNaN(userId) || isNaN(offset) || isNaN(limit)) {
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
    const response: any[] = await getCommentsByPostIdModel(
      postId,
      userId,
      limit,
      offset
    );

    const comments: GetCommentType[] = response[0];

    console.log(comments);

    let pagination: Pagination | null = null;
    let nextCommentId: number | null = null;

    if (comments.length > limit) {
      nextCommentId = comments[comments.length - 1].comment_id;
      pagination = {
        hasNextPage: true,
        nextId: comments[comments.length - 1].comment_id,
      };
      comments.pop();
    }

    const successObject: SuccessResponseType<GetCommentType[]> = {
      status: "success",
      code: 200,
      message: "get comments successful",
      data: comments,
      pagination: pagination,
    };

    return res.status(200).json(successObject);
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

// Function to delete comment
export const deleteComment = async (req: Request, res: Response) => {
  const requiredParams = ["commentId", "userId"];

  if (!req.query.commentId || !req.query.userId) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const commentId = Number(req.query.commentId);
  const userId = Number(req.query.userId);

  if (isNaN(commentId) || isNaN(userId)) {
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
    const response: any[] = await deleteCommentModel(commentId, userId);

    if (response[0].affectedRows === 0) {
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

    const dataObject: DeleteCommentType = {
      comment_id: commentId,
      user_id: userId,
    };
    const successObject: SuccessResponseType<DeleteCommentType> = {
      status: "success",
      code: 200,
      message: "Delete a comment successful",
      data: dataObject,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

// Function to update comment
export const updateComment = async (req: Request, res: Response) => {
  const requiredParams = ["comment_id", "user_id"];

  if (!req.body.comment_id || !req.body.user_id) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  let {
    comment_id,
    user_id,
    content = "",
    media_type_id = null,
    media_url = null,
  } = req.body;

  comment_id = Number(comment_id);
  user_id = Number(user_id);

  if ((media_type_id === null || media_url === null) && content.length <= 0) {
    const errors: ErrorType[] = [
      {
        field: "content, media_type_id, media_url",
        type: "validate",
        message: "There is no content or media attached",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  if (isNaN(comment_id) || isNaN(user_id)) {
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
    const response = await updateCommentModel(
      comment_id,
      user_id,
      content,
      media_type_id,
      media_url
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

    const dataObject: UpdateCommentType = {
      commentId: comment_id,
      userId: user_id,
      content: content,
      media_type_id: media_type_id,
      media_url: media_url,
    };

    const successObject: SuccessResponseType<UpdateCommentType> = {
      status: "success",
      code: 200,
      message: "Add post successful",
      data: dataObject,
      pagination: null,
    };

    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
