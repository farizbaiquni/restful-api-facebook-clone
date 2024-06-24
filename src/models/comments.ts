import { RowDataPacket } from "mysql2";
import { getConnection } from "../configs/database";
import { AddCommentType } from "../types/CommentType";
import { CommentMediaTableType } from "../types/MediaType";

export const addCommentModel = async (
  comment: AddCommentType,
  mediaTypeId: number | null,
  mediaUrl: string | null
) => {
  const sqlAddCommentTable = "INSERT INTO comments SET ?";
  const sqlAddCommentMediaTable = "INSERT INTO comment_media SET ?";
  const sqlGetCommentById = `
      SELECT 
        comments.comment_id,
        comments.post_id,
        comments.parent_comment_id,
        comments.user_id,
        comments.content,
        comments.created_at,
        comments.updated_at,
        comment_media.media_type_id,
        comment_media.media_url,
        users.first_name,
        users.last_name,
        users.profile_picture,
        (
          SELECT COUNT(*)
          FROM comments AS replies
          WHERE replies.parent_comment_id = comments.comment_id
            AND replies.is_deleted = 0
        ) AS total_replies,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'like')
        ) AS total_like,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'love')
        ) AS total_love,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'haha')
        ) AS total_haha,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'wow')
        ) AS total_wow,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'sad')
        ) AS total_sad,
        (
          SELECT COUNT(*)
          FROM comment_reactions
          WHERE comment_reactions.comment_id = comments.comment_id
            AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'angry')
        ) AS total_angry
        FROM comments
        LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
        LEFT JOIN users ON comments.user_id = users.user_id
        WHERE comments.comment_id = ?
        LIMIT 1
      `;
  let connection;

  try {
    connection = await getConnection();

    await connection.beginTransaction();

    const [result]: any = await connection.query(sqlAddCommentTable, comment);
    const commentId: number = Number(result.insertId);

    if (mediaTypeId !== null && mediaUrl !== null) {
      const commentMediaObj: CommentMediaTableType = {
        comment_id: commentId,
        media_type_id: mediaTypeId,
        media_url: mediaUrl,
      };
      await connection.query(sqlAddCommentMediaTable, commentMediaObj);
    }

    const response = await connection.execute(sqlGetCommentById, [commentId]);

    await connection.commit();

    return response;
  } catch (error) {
    console.log(error);
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getCommentsByPostIdModel = async (
  postId: number,
  userId: number,
  limit: number,
  offset: number
) => {
  const sqlQueryNonAuthUser = `
    SELECT 
      comments.comment_id,
      comments.post_id,
      comments.parent_comment_id,
      comments.user_id,
      comments.content,
      comments.created_at,
      comments.updated_at,
      comment_media.comment_media_id,
      comment_media.media_type_id,
      comment_media.media_url,
      users.first_name,
      users.last_name,
      users.profile_picture,
      (
        SELECT COUNT(*)
        FROM comments AS replies
        WHERE replies.parent_comment_id = comments.comment_id
          AND replies.is_deleted = 0
      ) AS total_replies,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'like')
      ) AS total_like,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'love')
      ) AS total_love,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'haha')
      ) AS total_haha,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'wow')
      ) AS total_wow,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'sad')
      ) AS total_sad,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'angry')
      ) AS total_angry
    FROM comments
    LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
    LEFT JOIN users ON comments.user_id = users.user_id
    WHERE comments.post_id = ? AND comments.is_deleted = 0
    ORDER BY comments.updated_at DESC
    LIMIT ?
    OFFSET ?`;
  let connection;
  try {
    connection = await getConnection();
    return await connection.query<RowDataPacket[]>(sqlQueryNonAuthUser, [
      postId,
      limit + 1,
      offset,
    ]);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getInitialCommentModel = async (
  postId: number,
  userId: number
) => {
  const sqlQueryAuthUser = `
    SELECT 
      comments.comment_id,
      comments.post_id,
      comments.parent_comment_id,
      comments.user_id,
      comments.content,
      comments.created_at,
      comments.updated_at,
      comment_media.comment_media_id,
      comment_media.media_type_id,
      comment_media.media_url,
      users.first_name,
      users.last_name,
      users.profile_picture,
      (
        SELECT COUNT(*)
        FROM comments AS replies
        WHERE replies.parent_comment_id = comments.comment_id
          AND replies.is_deleted = 0
      ) AS total_replies,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'like')
      ) AS total_like,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'love')
      ) AS total_love,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'haha')
      ) AS total_haha,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'wow')
      ) AS total_wow,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'sad')
      ) AS total_sad,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'angry')
      ) AS total_angry
    FROM comments
    LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
    LEFT JOIN users ON comments.user_id = users.user_id
    WHERE comments.post_id = ? AND comments.user_id = ? AND comments.is_deleted = 0 
    ORDER BY comments.updated_at DESC
    LIMIT 1`;

  const sqlQueryNonAuthUser = `
    SELECT 
      comments.comment_id,
      comments.post_id,
      comments.parent_comment_id,
      comments.user_id,
      comments.content,
      comments.created_at,
      comments.updated_at,
      comment_media.comment_media_id,
      comment_media.media_type_id,
      comment_media.media_url,
      users.first_name,
      users.last_name,
      users.profile_picture,
      (
        SELECT COUNT(*)
        FROM comments AS replies
        WHERE replies.parent_comment_id = comments.comment_id
          AND replies.is_deleted = 0
      ) AS total_replies,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'like')
      ) AS total_like,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'love')
      ) AS total_love,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'haha')
      ) AS total_haha,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'wow')
      ) AS total_wow,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'sad')
      ) AS total_sad,
      (
        SELECT COUNT(*)
        FROM comment_reactions
        WHERE comment_reactions.comment_id = comments.comment_id
          AND comment_reactions.reaction_id = (SELECT reaction_id FROM reaction_type WHERE reaction_name = 'angry')
      ) AS total_angry
    FROM comments
    LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
    LEFT JOIN users ON comments.user_id = users.user_id
    WHERE comments.post_id = ? AND comments.user_id != ? AND comments.is_deleted = 0
    ORDER BY comments.updated_at DESC
    LIMIT 1`;

  let connection;
  try {
    connection = await getConnection();
    const resultAuthUser = await connection.query<RowDataPacket[]>(
      sqlQueryAuthUser,
      [postId, userId]
    );

    if (resultAuthUser[0].length > 0) return resultAuthUser;
    return await connection.query<RowDataPacket[]>(sqlQueryNonAuthUser, [
      postId,
      userId,
    ]);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const deleteCommentModel = async (commentId: number, userId: number) => {
  let connection;
  try {
    connection = await getConnection();
    const querySoftDeleteComment = `
      UPDATE comments
      SET is_deleted = 1, deleted_at = NOW()
      WHERE comment_id = ? AND user_id = ? AND is_deleted = 0`;
    return await connection.execute(querySoftDeleteComment, [
      commentId,
      userId,
    ]);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const updateCommentModel = async (
  comment_id: number,
  user_id: number,
  content: string,
  media_type_id: number | null,
  media_url: string | null
) => {
  let connection;
  try {
    connection = await getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Update comment content
    const queryUpdateComment = `
      UPDATE comments
      SET content = ?, updated_at = NOW()
      WHERE comment_id = ? AND user_id = ? AND is_deleted = 0`;

    const [resultUpdateComment]: any = await connection.execute(
      queryUpdateComment,
      [content, comment_id, user_id]
    );

    let affectedRows = resultUpdateComment.affectedRows;

    if (affectedRows >= 1) {
      // Update comment media if media_type_id and media_url are provided
      if (media_type_id !== null && media_url !== null) {
        const queryUpdateCommentMedia = `
        UPDATE comment_media
        SET media_type_id = ?, media_url = ?
        WHERE comment_id = ?`;

        const [resultUpdateCommentMedia]: any = await connection.execute(
          queryUpdateCommentMedia,
          [media_type_id, media_url, comment_id]
        );

        affectedRows += resultUpdateCommentMedia.affectedRows;
      }
    }

    // Commit transaction
    await connection.commit();
    return { success: true, affectedRows: affectedRows };
  } catch (error) {
    // Rollback transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
