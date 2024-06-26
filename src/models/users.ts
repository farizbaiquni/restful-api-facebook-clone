import { getConnection } from "../configs/database";
import { UserType } from "../types/UserType";

export const getUserByIdModel = async (userId: string) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `SELECT user_id, first_name, last_name, email, cover_photo, bio, birth_date, gender_id FROM Users WHERE user_id = ?`;
    return await connection.query(sqlQuery, userId);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
