import { getConnection } from "../configs/database";

export const getTop3PostReactionsByPostIdModel = async (post_id: number) => {
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
        WHERE pr.post_id = ?
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

export const getPostReactionsByUserIdModel = async (
  user_id: number,
  post_id: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `
      SELECT pr.post_reaction_id, pr.user_id, pr.post_id, pr.reaction_id, rt.reaction_name
      FROM post_reactions pr
      JOIN reaction_type rt ON pr.reaction_id = rt.reaction_id
      WHERE pr.user_id = ? AND pr.post_id = ?
    `;
    return await connection.execute(sqlQuery, [user_id, post_id]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const addPostReactionModel = async (
  user_id: number,
  post_id: number,
  reaction_id: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery =
      "INSERT INTO post_reactions (user_id, post_id, reaction_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE reaction_id = ?";
    return await connection.execute(sqlQuery, [
      user_id,
      post_id,
      reaction_id,
      reaction_id,
    ]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const deletePostReactionModel = async (
  user_id: number,
  post_id: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery =
      "DELETE FROM post_reactions WHERE user_id = ? AND post_id = ?";
    return await connection.execute(sqlQuery, [user_id, post_id]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
