import { getConnection } from "../configs/database";
import { UserType } from "../types/UserType";

export const signUpModel = async (user: UserType) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = "INSERT INTO Users SET ?";
    return await connection.query(sqlQuery, user);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const loginModel = async (email: string) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `SELECT user_id, email, password, salt FROM Users WHERE email = ?`;
    return await connection.query(sqlQuery, email);
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

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
