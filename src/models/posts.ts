import { getConnection } from "../configs/database";
import { AudienceTableType } from "../types/AudienceType";
import { MediaTableType } from "../types/MediaType";
import { AddPostType } from "../types/PostType";

export const addPostModel = async (
  post: AddPostType,
  media: MediaTableType[],
  audienceInclude: string[],
  audienceExclude: string[]
) => {
  let connection;
  try {
    connection = await getConnection();

    const sqlAddPostTable = `INSERT INTO Posts SET ?`;
    const sqlAddMediaTable = `INSERT INTO Media SET ?`;
    const sqlAddAudienceIncludeTable = `INSERT INTO AudienceInclude SET ?`;
    const sqlAddAudienceExcludeTable = `INSERT INTO AudienceExclude SET ?`;

    const sqlGetPostByPostId = `SELECT 
      p.user_id AS user_id,
      p.post_id AS post_id, 
      p.content AS content, 
      p.emoji AS emoji, 
      p.activity_icon_url AS activity_icon_url, 
      p.gif_url AS gif_url, 
      p.latitude AS latitude, 
      p.longitude AS longitude, 
      p.location_name AS location_name, 
      p.audience_type_id AS audience_type_id, 
      p.created_at AS created_at, 
      p.updated_at AS updated_at,  
      u.first_name AS first_name,
      u.last_name AS last_name,
      u.profile_picture AS profile_picture,
      COALESCE(
          (
              SELECT JSON_ARRAYAGG(JSON_OBJECT(
                  'media_type_id', m.media_type_id, 
                  'media_url', m.media_url
              )) 
              FROM media m 
              WHERE m.post_id = p.post_id
          ), JSON_ARRAY()
      ) AS media,
      JSON_OBJECT(
          'like', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 1), 0),
          'love', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 2), 0),
          'care', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 3), 0),
          'haha', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 4), 0),
          'wow', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 5), 0),
          'sad', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 6), 0),
          'angry', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 7), 0),
          'total', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id), 0)
      ) AS reactions,
      COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id), 0) AS total_comments,
      COALESCE((SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.post_id), 0) AS total_shares
    FROM posts p 
    JOIN users u ON p.user_id = u.user_id 
    WHERE p.post_id = ? AND p.user_id = ?
    GROUP BY p.post_id, p.user_id, p.content, p.emoji, p.activity_icon_url, p.gif_url, p.latitude, p.longitude, p.location_name, p.audience_type_id, p.created_at, p.updated_at, u.first_name, u.last_name, u.profile_picture 
    ORDER BY p.created_at DESC
    LIMIT 1;`;

    await connection.beginTransaction();

    const [result]: any = await connection.query(sqlAddPostTable, post);
    const postId = Number(result.insertId);

    for (const data of media) {
      const mediaObj: MediaTableType = {
        post_id: postId,
        media_type_id: data.media_type_id,
        media_url: data.media_url,
      };
      await connection.query(sqlAddMediaTable, mediaObj);
    }

    for (const data of audienceInclude) {
      const audienceObj: AudienceTableType = {
        post_id: postId,
        user_id: data,
      };
      await connection.query(sqlAddAudienceIncludeTable, audienceObj);
    }

    for (const data of audienceExclude) {
      const audienceObj: AudienceTableType = {
        post_id: postId,
        user_id: data,
      };
      await connection.query(sqlAddAudienceExcludeTable, audienceObj);
    }
    await connection.commit();
    return await connection.execute(sqlGetPostByPostId, [postId, post.user_id]);
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getPostsModel = async (
  offset: number,
  limit: number,
  userId: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
    SELECT 
      p.user_id AS user_id,
      p.post_id AS post_id, 
      p.content AS content, 
      p.emoji AS emoji, 
      p.activity_icon_url AS activity_icon_url, 
      p.gif_url AS gif_url, 
      p.latitude AS latitude, 
      p.longitude AS longitude, 
      p.location_name AS location_name, 
      p.audience_type_id AS audience_type_id, 
      p.created_at AS created_at, 
      p.updated_at AS updated_at,  
      u.first_name AS first_name,
      u.last_name AS last_name,
      u.profile_picture AS profile_picture,
      COALESCE(
          (
              SELECT JSON_ARRAYAGG(JSON_OBJECT(
                  'media_type_id', m.media_type_id, 
                  'media_url', m.media_url
              )) 
              FROM media m 
              WHERE m.post_id = p.post_id
          ), JSON_ARRAY()
      ) AS media,
      JSON_OBJECT(
          'like', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 1 AND pr.is_deleted = 0), 0),
          'love', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 2 AND pr.is_deleted = 0), 0),
          'care', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 3 AND pr.is_deleted = 0), 0),
          'haha', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 4 AND pr.is_deleted = 0), 0),
          'wow', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 5 AND pr.is_deleted = 0), 0),
          'sad', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 6 AND pr.is_deleted = 0), 0),
          'angry', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.reaction_id = 7 AND pr.is_deleted = 0), 0),
          'total', COALESCE((SELECT COUNT(*) FROM post_reactions pr WHERE pr.post_id = p.post_id AND pr.is_deleted = 0), 0)
      ) AS reactions,
      COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id AND c.is_deleted = 0), 0) AS total_comments,
      COALESCE((SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.post_id), 0) AS total_shares
    FROM posts p 
    JOIN users u ON p.user_id = u.user_id 
    WHERE p.audience_type_id = ? AND p.post_id > ? AND p.is_deleted = 0 AND p.user_id != ?
    GROUP BY p.post_id, p.user_id, p.content, p.emoji, p.activity_icon_url, p.gif_url, p.latitude, p.longitude, p.location_name, p.audience_type_id, p.created_at, p.updated_at, u.first_name, u.last_name, u.profile_picture 
    ORDER BY p.created_at DESC
    LIMIT ?;`;

    return await connection.query(sqlQuery, [2, offset, userId, limit + 1]);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const deletePostModel = async (postId: number, userId: number) => {
  let connection;
  try {
    connection = await getConnection();
    const querySoftDeletePost = `
      UPDATE posts
      SET is_deleted = 1, deleted_at = NOW()
      WHERE post_id = ? AND user_id = ? AND is_deleted = 0`;

    return await connection.execute(querySoftDeletePost, [postId, userId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const undoDeletePostModel = async (postId: number, userId: number) => {
  let connection;
  try {
    connection = await getConnection();
    const undoDeletePostQuery = `
      UPDATE posts
      SET is_deleted = 0, deleted_at = NULL
      WHERE post_id = ? AND user_id = ? AND is_deleted = 1`;
    return await connection.execute(undoDeletePostQuery, [postId, userId]);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const undoDeleteMultiplePostsModel = async (
  postIds: number[],
  userId: number
) => {
  let connection;
  try {
    connection = await getConnection();

    // Membuat placeholder untuk post IDs
    const placeholders = postIds.map(() => "?").join(",");

    // Query untuk mengubah nilai is_deleted menjadi 0 untuk multiple post IDs
    const undoDeleteMultiplePostsQuery = `
      UPDATE posts
      SET is_deleted = 0, deleted_at = NULL
      WHERE post_id IN (${placeholders}) AND user_id = ? AND is_deleted = 1`;

    return await connection.execute(undoDeleteMultiplePostsQuery, [
      ...postIds,
      userId,
    ]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
