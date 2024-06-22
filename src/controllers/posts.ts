import { Request, Response } from "express";
import {
  AddPostType,
  DeletePostType,
  GetPostType,
  UndoDeletePostType,
  UndoDeleteMultiplePostsType,
} from "../types/PostType";
import {
  addPostModel,
  deletePostModel,
  getPostsModel,
  undoDeleteMultiplePostsModel,
  undoDeletePostModel,
} from "../models/posts";
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
    const response: any[] = await addPostModel(
      post,
      media,
      audience_include,
      audience_exclude
    );

    console.log("ADDED NEW POST : ", response);

    const successObject: SuccessResponseType<GetPostType | null> = {
      status: "success",
      code: 200,
      message: "Add post successful",
      data: response[0][0],
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  const requiredParams = ["userId"];
  const requiredParamsAreNumber = ["offset", "userId"];
  const limit: number = 5;

  if (!req.query.userId) {
    const errors: ErrorType[] = validateParams(req.query, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  let { offset = 0 } = req.query;
  offset = Number(offset);
  const userId = Number(req.query.userId);

  if (isNaN(offset) || isNaN(userId)) {
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
    const response: any[] = await getPostsModel(offset, limit, userId);
    const posts: GetPostType[] = response[0];
    let hasNextPage: boolean = false;
    let nextId: number | null = null;

    if (posts.length > limit) {
      hasNextPage = true;
      nextId = posts[posts.length - 1].post_id;
      response[0].pop();
    }

    const pagination: Pagination = {
      hasNextPage: hasNextPage,
      nextId: nextId,
    };

    const successObject: SuccessResponseType<GetPostType[]> = {
      status: "success",
      code: 200,
      message: "Get posts successful",
      data: response[0] as GetPostType[],
      pagination: nextId !== null ? pagination : null,
    };

    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json(DEFAULT_ERROR_RESPONSE_INTERNAL_SERVER);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const requiredParams = ["postId", "userId"];

  if (!req.query.postId || !req.query.userId) {
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
    const response: any[] = await deletePostModel(postId, userId);
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
    const dataObject: DeletePostType = {
      post_id: postId,
      user_id: userId,
    };
    const successObject: SuccessResponseType<DeletePostType> = {
      status: "success",
      code: 200,
      message: "Delete post successful",
      data: dataObject,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const undoDeletePost = async (req: Request, res: Response) => {
  const requiredParams = ["postId", "userId"];

  if (!req.body.postId || !req.body.userId) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const postId = Number(req.body.postId);
  const userId = Number(req.body.userId);

  if (isNaN(postId) || isNaN(userId)) {
    const errors: ErrorType[] = validateParamsAsNumber(
      req.body,
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
    const response: any[] = await undoDeletePostModel(postId, userId);
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
    const dataObject: UndoDeletePostType = {
      post_id: postId,
      user_id: userId,
    };
    const successObject: SuccessResponseType<UndoDeletePostType> = {
      status: "success",
      code: 200,
      message: "Undo delete a post successful",
      data: dataObject,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export const undoMultipleDeletePosts = async (req: Request, res: Response) => {
  const requiredParams = ["postIdArr", "userId"];
  const requiredParamsAreNumber = ["userId"];

  function checkAllPostIdArrAreNumbers(stringArray: string[]): boolean {
    return stringArray.every((stringElement) => !isNaN(Number(stringElement)));
  }

  if (!req.body.postIdArr || !req.body.userId) {
    const errors: ErrorType[] = validateParams(req.body, requiredParams);
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  if (!Array.isArray(req.body.postIdArr)) {
    const errors: ErrorType[] = [
      {
        field: "postIdArr",
        type: "validate",
        message: "Parameter postIdArr is no an array",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const postIdArrAny: any[] = req.body.postIdArr as any[];

  if (postIdArrAny.length === 0) {
    const errors: ErrorType[] = [
      {
        field: "postIdArr",
        type: "validate",
        message: "Parameter postIdArr is empty",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  if (!checkAllPostIdArrAreNumbers(postIdArrAny)) {
    const errors: ErrorType[] = [
      {
        field: "postIdArr",
        type: "validate",
        message: "Not all elements of postIdArr are numbers",
      },
    ];
    const errorObject: ErrorResponseType = {
      status: ErrorStatusEnum.INVALID_PARAMETER,
      code: 400,
      errors: errors,
    };
    return res.status(400).json(errorObject);
  }

  const postIdArr: number[] = postIdArrAny.map((data) => Number(data));
  const userId = Number(req.body.userId);

  if (isNaN(userId)) {
    const errors: ErrorType[] = validateParamsAsNumber(
      req.body,
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
    const response: any[] = await undoDeleteMultiplePostsModel(
      postIdArr,
      userId
    );

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

    const dataObject: UndoDeleteMultiplePostsType = {
      post_id_array: postIdArr,
      user_id: userId,
    };
    const successObject: SuccessResponseType<UndoDeleteMultiplePostsType> = {
      status: "success",
      code: 200,
      message: "Undo multiple delete posts successful",
      data: dataObject,
      pagination: null,
    };
    return res.status(200).json(successObject);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
