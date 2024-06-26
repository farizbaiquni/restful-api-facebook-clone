import { getConnection } from "../configs/database";
import { UserType } from "../types/UserType";

export const registerModel = async (user: UserType) => {
  const sqlQuery = "INSERT INTO Users SET ?";
  let connection;
  try {
    connection = await getConnection();
    return await connection.query(sqlQuery, user);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const loginModel = async (email: string) => {
  const sqlQuery = `SELECT user_id, email, password, salt FROM Users WHERE email = ?`;
  let connection;
  try {
    connection = await getConnection();
    return await connection.query(sqlQuery, email);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
