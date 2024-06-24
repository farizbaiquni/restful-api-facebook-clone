import { Request, Response } from "express";
import { getConnection } from "../configs/database";

const removeReaction = async (req: Request, res: Response) => {
  const { user_id, comment_id } = req.body;

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const deleteReactionQuery =
      "DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?";
    await connection.query(deleteReactionQuery, [user_id, comment_id]);

    const updateTotalReactionsQuery =
      "UPDATE comments SET total_reactions = total_reactions - 1 WHERE comment_id = ?";
    await connection.query(updateTotalReactionsQuery, [comment_id]);

    await connection.commit();
    res.status(200).send({ message: "Reaction removed successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).send({ message: "Error removing reaction", error });
  } finally {
    await connection.end();
  }
};
