import { getConnection } from "../configs/database";

export const getProfileModel = async (userId: number) => {
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

export const updateProfile = async (
  userId: number,
  profilePicture: string | null,
  coverPhoto: string | null,
  bio: string | null,
  birthDate: string,
  genderId: number
) => {
  let connection;
  try {
    connection = await getConnection();
    const sqlQuery = `UPDATE Customers SET 
    profile_picture = ${profilePicture} 
    cover_photo = ${coverPhoto} 
    bio = ${bio} 
    birth_date = ${birthDate}
    gender_id = ${genderId}
    WHERE user_id = ${userId};`;
    return connection.query(sqlQuery);
  } catch (error) {
  } finally {
  }
};
