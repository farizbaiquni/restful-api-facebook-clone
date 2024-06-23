import { getConnection } from "../configs/database";

export const getTop3PostReactionsModel = async (post_id: number) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
    SELECT pr.reaction_id, pr.reaction_name, pr.total_count
    FROM (
      SELECT pr.post_reaction_id, pr.user_id, pr.post_id, pr.reaction_id, rt.reaction_name, 
            COUNT(*) as total_count,
            ROW_NUMBER() OVER (PARTITION BY pr.reaction_id ORDER BY COUNT(*) DESC) as rn
      FROM post_reactions pr
      JOIN reaction_type rt ON pr.reaction_id = rt.reaction_id
      WHERE pr.post_id = ? AND pr.is_deleted = 0
      GROUP BY pr.reaction_id, pr.post_reaction_id, rt.reaction_name, pr.user_id, pr.post_id
    ) AS pr
    WHERE pr.rn <= 3
    ORDER BY pr.rn;
  `;
    return await connection.execute(sqlQuery, [post_id]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getPostReactionModel = async (userId: number, postId: number) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
      SELECT pr.post_reaction_id, pr.user_id, pr.post_id, pr.reaction_id, rt.reaction_name
      FROM post_reactions pr
      JOIN reaction_type rt ON pr.reaction_id = rt.reaction_id
      WHERE pr.user_id = ? AND pr.post_id = ? AND pr.is_deleted = 0;`;
    return await connection.execute(sqlQuery, [userId, postId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const addPostReactionModel = async (
  userId: number,
  postId: number,
  reactionId: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
    INSERT INTO 
      post_reactions (user_id, post_id, reaction_id) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE reaction_id = VALUES(reaction_id), is_deleted = 0, deleted_at = NULL;`;
    return await connection.execute(sqlQuery, [userId, postId, reactionId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const deletePostReactionModel = async (
  userId: number,
  postId: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
      UPDATE post_reactions 
      SET is_deleted = 1, deleted_at = NOW() 
      WHERE user_id = ? AND post_id = ?`;
    return await connection.execute(sqlQuery, [userId, postId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
