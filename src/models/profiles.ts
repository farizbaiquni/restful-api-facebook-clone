import { getConnection } from "../configs/database";

export const getProfileByIdModel = async (userId: number) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = "SELECT * FROM Users WHERE user_id = ?";
    return await connection.execute(sqlQuery, [userId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
