import { RowDataPacket } from "mysql2";
import { getConnection } from "../configs/database";
import { AddCommentType } from "../types/CommentType";
import { CommentMediaTableType } from "../types/MediaType";

export const addCommentModel = async (
  comment: AddCommentType,
  media_type_id: number | null,
  media_url: string | null
) => {
  const sqlAddCommentTable = "INSERT INTO comments SET ?";
  const sqlAddCommentMediaTable = "INSERT INTO comment_media SET ?";
  const sqlGetCommentById = `
      SELECT 
        comments.comment_id,
        comments.post_id,
        comments.parent_comment_id,
        comments.content,
        comments.user_id,
        comments.created_at,
        comments.updated_at,
        comment_media.media_type_id,
        comment_media.media_url,
        (
          SELECT COUNT(*)
          FROM comments AS replies
          WHERE replies.parent_comment_id = comments.comment_id
        ) AS total_replies
      FROM comments
      LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
      WHERE comments.comment_id = ?
      LIMIT 1
    `;
  let connection;

  try {
    connection = await getConnection();

    await connection.beginTransaction();
    const [result]: any = await connection.query(sqlAddCommentTable, comment);
    const comment_id: number = Number(result.insertId);

    if (media_type_id !== null && media_url !== null) {
      const commentMediaObj: CommentMediaTableType = {
        comment_id: comment_id,
        media_type_id: media_type_id,
        media_url: media_url,
      };
      await connection.query(sqlAddCommentMediaTable, commentMediaObj);
    }

    await connection.commit();
    return await connection.execute(sqlGetCommentById, [comment_id]);
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
  limit: number,
  offset: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
      SELECT 
        comments.comment_id,
        comments.post_id,
        comments.parent_comment_id,
        comments.user_id,
        comments.content,
        comments.created_at,
        comments.updated_at,
        CASE
          WHEN comment_media.comment_media_id IS NULL THEN NULL
          ELSE JSON_OBJECT(
            'comment_media_id', comment_media.comment_media_id,
            'media_type_id', comment_media.media_type_id,
            'media_url', comment_media.media_url
          )
        END AS media,
        (
          SELECT COUNT(*)
          FROM comments AS replies
          WHERE replies.parent_comment_id = comments.comment_id
        ) AS total_replies
      FROM comments
      LEFT JOIN comment_media ON comments.comment_id = comment_media.comment_id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
      LIMIT ?
      OFFSET ?
    `;

    return await connection.query<RowDataPacket[]>(sqlQuery, [
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
