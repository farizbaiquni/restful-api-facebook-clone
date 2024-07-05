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
} from "../types/ResponsesType";
import { AddCommentReplyType } from "../types/CommentRepliesType";
import {
  addCommentReplyModel,
  deleteCommentReplyModel,
  getCommentRepliesModel,
  updateCommentReplyModel,
} from "../models/commentRepliesModel";

// Function to add comment to post
export const addCommentReply = async (req: Request, res: Response) => {
  const requiredParams = [
    "user_id",
    "post_id",
    "tag_id_user_parent_comment",
    "tag_name_user_parent_comment",
  ];

  if (
    !req.body.user_id ||
    !req.body.post_id ||
    !req.body.tag_id_user_parent_comment ||
    !req.body.tag_name_user_parent_comment
  ) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  const {
    user_id,
    post_id,
    parent_comment_id = null,
    tag_id_user_parent_comment,
    tag_name_user_parent_comment,
    content = "",
    media_type_id = null,
    media_url = null,
  } = req.body;

  const userId = Number(user_id);
  const postId = Number(post_id);
  const tagIdUserParentComment = Number(tag_id_user_parent_comment);

  if (content.length <= 0 && (media_type_id === null || media_url === null)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = [
      {
        field: "content, media_type_id, media_url",
        type: "validate",
        message: "There is no content or media attached",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  if (isNaN(userId) || isNaN(postId) || isNaN(tagIdUserParentComment)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParams
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  const comment: AddCommentReplyType = {
    user_id: userId,
    post_id: postId,
    parent_comment_id: parent_comment_id,
    tag_id_user_parent_comment: tagIdUserParentComment,
    tag_name_user_parent_comment: tag_name_user_parent_comment,
    content: content,
  };

  try {
    const response: any = await addCommentReplyModel(
      comment,
      media_type_id,
      media_url
    );
    const httpResponseCode = 201;
    const successObject: SuccessResponseType<GetCommentType> = {
      status: "success",
      code: httpResponseCode,
      message: "Add comment reply successful",
      data: response[0][0],
      pagination: null,
    };
    return res.status(httpResponseCode).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// Function to get comments by post id
export const getCommentReplies = async (req: Request, res: Response) => {
  const requiredParams = ["parentCommentId"];
  const requiredParamsAreNumber = ["parentCommentId", "offset", "limit"];

  if (!req.query.parentCommentId) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  let { offset = 0, limit = 5 } = req.query;

  const parentCommentId = Number(req.query.parentCommentId);
  offset = Number(offset);
  limit = Number(limit);

  if (isNaN(parentCommentId) || isNaN(offset) || isNaN(limit)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParamsAreNumber
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const response: any[] = await getCommentRepliesModel(
      parentCommentId,
      limit,
      offset
    );

    let comments: GetCommentType[] = response[0];

    let pagination: Pagination | null = null;
    let nextCommentId: number | null = null;

    if (comments.length > limit) {
      nextCommentId = comments[comments.length - 1].comment_id;
      pagination = {
        hasNextPage: true,
        nextId: comments[comments.length - 2].comment_id,
      };
      comments.pop();
    }

    const httpResponseCode = 200;
    const successObject: SuccessResponseType<GetCommentType[]> = {
      status: "success",
      code: httpResponseCode,
      message: "get comments successful",
      data: comments,
      pagination: pagination,
    };

    return res.status(httpResponseCode).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// Function to delete comment
export const deleteCommentReply = async (req: Request, res: Response) => {
  const requiredParams = ["postId", "commentId", "userId"];

  if ((!req.query.postId && !req.query.commentId) || !req.query.userId) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  const postId = Number(req.query.postId);
  const commentId = Number(req.query.commentId);
  const userId = Number(req.query.userId);

  if (isNaN(postId) || isNaN(commentId) || isNaN(userId)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParams
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const response = await deleteCommentReplyModel(postId, commentId, userId);

    if (response.affectedRows === 0) {
      const httpResponseCode = 404;
      const errors: ErrorType[] = [
        {
          type: "not found",
          message: "resource not found",
        },
      ];
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
        code: httpResponseCode,
        errors: errors,
      };
      return res.status(httpResponseCode).json(errorObject);
    }

    const httpResponseCode = 200;
    const dataObject: DeleteCommentType = {
      comment_id: commentId,
      user_id: userId,
    };
    const successObject: SuccessResponseType<DeleteCommentType> = {
      status: "success",
      code: httpResponseCode,
      message: "Delete a comment successful",
      data: dataObject,
      pagination: null,
    };
    return res.status(httpResponseCode).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

// Function to update comment
export const updateCommentReply = async (req: Request, res: Response) => {
  const requiredParams = ["comment_id", "user_id"];

  if (!req.body.comment_id || !req.body.user_id) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
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
    const httpResponseCode = 400;
    const errors: ErrorType[] = [
      {
        field: "content, media_type_id, media_url",
        type: "validate",
        message: "There is no content or media attached",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  if (isNaN(comment_id) || isNaN(user_id)) {
    const httpResponseCode = 400;
    const errors: ErrorType[] = validateParamsAsNumber(
      req.query,
      requiredParams
    );
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: httpResponseCode,
      errors: errors,
    };
    return res.status(httpResponseCode).json(errorObject);
  }

  try {
    const response = await updateCommentReplyModel(
      comment_id,
      user_id,
      content,
      media_type_id,
      media_url
    );

    if (response.affectedRows === 0) {
      const httpResponseCode = 404;
      const errors: ErrorType[] = [
        {
          type: "not found",
          message: "resource not found",
        },
      ];
      const errorObject: ErrorResponseType = {
        status: ErrorStatusEnum.RESOURCE_NOT_FOUND,
        code: httpResponseCode,
        errors: errors,
      };
      return res.status(httpResponseCode).json(errorObject);
    }

    const httpResponseCode = 200;
    const dataObject: UpdateCommentType = {
      commentId: comment_id,
      userId: user_id,
      content: content,
      media_type_id: media_type_id,
      media_url: media_url,
    };

    const successObject: SuccessResponseType<UpdateCommentType> = {
      status: "success",
      code: httpResponseCode,
      message: "Update a comment reply successful",
      data: dataObject,
      pagination: null,
    };

    return res.status(httpResponseCode).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};
