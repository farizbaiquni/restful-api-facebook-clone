import { getConnection } from "../configs/database";
import { AudienceType } from "../types/Audience";
import { MediaType } from "../types/Media";
import { PostType } from "../types/PostType";

export const addPostModel = async (
  post: PostType,
  media: MediaType[] | null,
  audienceInclude: AudienceType[] | null,
  audienceExclude: AudienceType[] | null
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlAddPostTable = `INSERT INTO Posts SET ?`;
    const sqlAddMediaTable = `INSERT INTO Media SET ?`;
    const sqlAddAudienceIncludeTable = `INSERT INTO AudienceInclude SET ?`;
    const sqlAddAudienceExcludeTable = `INSERT INTO AudienceExclude SET ?`;

    await connection.beginTransaction();

    // Insert post and get the inserted post_id
    const [result]: any = await connection.query(sqlAddPostTable, post);
    const postId = result.insertId;

    // Insert media related to the post
    if (media !== null) {
      for (const data of media) {
        data.post_id = postId; // Ensure media data has the correct post_id
        await connection.query(sqlAddMediaTable, data);
      }
    }

    // Insert audience include related to the post
    if (audienceInclude !== null) {
      for (const data of audienceInclude) {
        data.post_id = postId; // Ensure audience include data has the correct post_id
        await connection.query(sqlAddAudienceIncludeTable, data);
      }
    }

    // Insert audience exclude related to the post
    if (audienceExclude !== null) {
      for (const data of audienceExclude) {
        data.post_id = postId; // Ensure audience exclude data has the correct post_id
        await connection.query(sqlAddAudienceExcludeTable, data);
      }
    }
    await connection.commit();
    return postId;
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export default addPostModel;
