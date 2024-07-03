import { getConnection } from "../configs/database";
import { ReactionTypeEnum } from "../types/ReactionType";
import { ResultAffectedRows } from "../types/ResponsesType";

export const getCommentReactionModel = async (
  userId: number,
  commentId: number
) => {
  const sqlQueryGetCommentReaction = `
    SELECT cr.comment_reaction_id, cr.user_id, cr.comment_id, cr.reaction_id, rt.reaction_name
    FROM comment_reactions cr
    JOIN reaction_type rt ON cr.reaction_id = rt.reaction_id
    WHERE cr.user_id = ? AND cr.comment_id = ? AND cr.is_deleted = 0;`;

  let connection;
  try {
    connection = await getConnection();
    return await connection.execute(sqlQueryGetCommentReaction, [
      userId,
      commentId,
    ]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const addOrUpdateCommentReactionModel = async (
  userId: number,
  commentId: number,
  reactionId: number
) => {
  const sqlUpdateCommentReaction = `
    INSERT INTO 
      comment_reactions (user_id, comment_id, reaction_id) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE reaction_id = VALUES(reaction_id), is_deleted = 0, deleted_at = NULL;
  `;

  const sqlGetPreviousCommentReaction = `
    SELECT reaction_id
    FROM comment_reactions
    WHERE user_id = ? AND comment_id = ? AND is_deleted = 0
    FOR UPDATE
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // Mengunci baris yang dipilih dengan FOR UPDATE
    const [previousReactionRows]: any = await connection.execute(
      sqlGetPreviousCommentReaction,
      [userId, commentId]
    );

    const previousReactionId =
      previousReactionRows.length > 0
        ? previousReactionRows[0].reaction_id
        : null;

    const sqlUpdateTotalReactionPost = `
      UPDATE comments
      SET 
        total_likes = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.LIKE} THEN total_likes - 1
                        ELSE total_likes 
                      END,
        total_loves = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.LOVE} THEN total_loves - 1
                        ELSE total_loves 
                      END,
        total_cares = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.CARE} THEN total_cares - 1
                        ELSE total_cares 
                      END,
        total_haha = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.HAHA} THEN total_haha - 1
                        ELSE total_haha 
                      END,
        total_wows = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.WOW} THEN total_wows - 1
                        ELSE total_wows 
                      END,
        total_sads = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.SAD} THEN total_sads - 1
                        ELSE total_sads 
                      END,
        total_angries = CASE 
                          WHEN ${previousReactionId} = ${ReactionTypeEnum.ANGRY} THEN total_angries - 1
                          ELSE total_angries 
                        END,
        total_likes = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.LIKE} THEN total_likes + 1
                        ELSE total_likes 
                      END,
        total_loves = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.LOVE} THEN total_loves + 1
                        ELSE total_loves 
                      END,
        total_cares = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.CARE} THEN total_cares + 1
                        ELSE total_cares 
                      END,
        total_haha = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.HAHA} THEN total_haha + 1
                        ELSE total_haha 
                      END,
        total_wows = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.WOW} THEN total_wows + 1
                        ELSE total_wows 
                      END,
        total_sads = CASE 
                        WHEN ${reactionId} = ${ReactionTypeEnum.SAD} THEN total_sads + 1
                        ELSE total_sads 
                      END,
        total_angries = CASE 
                          WHEN ${reactionId} = ${ReactionTypeEnum.ANGRY} THEN total_angries + 1
                          ELSE total_angries 
                        END,
        total_reactions = CASE 
                            WHEN ${previousReactionId} IS NULL THEN total_reactions + 1
                            ELSE total_reactions 
                          END
      WHERE comment_id = ?;`;

    const [resultUpdateCommentReaction]: any = await connection.execute(
      sqlUpdateCommentReaction,
      [userId, commentId, reactionId]
    );

    let affectedRows = resultUpdateCommentReaction.affectedRows;

    if (affectedRows >= 1) {
      await connection.execute(sqlUpdateTotalReactionPost, [commentId]);
    }

    await connection.commit();

    const resultAffectedRows: ResultAffectedRows = {
      isSuccess: affectedRows >= 1,
      affectedRows,
    };

    return resultAffectedRows;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const deleteCommentReactionModel = async (
  userId: number,
  commentId: number
) => {
  const sqlUpdatePostReaction = `
    UPDATE comment_reactions 
    SET is_deleted = 1, deleted_at = NOW() 
    WHERE user_id = ? AND comment_id = ? AND is_deleted = 0;`;

  const sqlPreviousReaction = `
    SELECT reaction_id
    FROM comment_reactions
    WHERE user_id = ? AND comment_id = ? AND is_deleted = 0
    FOR UPDATE;
  `;

  let connection;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const [previousReactionRows]: any = await connection.execute(
      sqlPreviousReaction,
      [userId, commentId]
    );

    const previousReactionId =
      previousReactionRows.length > 0
        ? previousReactionRows[0].reaction_id
        : null;

    const sqlUpdateTotalReactionPost = `
      UPDATE comments
      SET 
        total_likes = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.LIKE} THEN total_likes - 1
                        ELSE total_likes 
                      END,
        total_loves = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.LOVE} THEN total_loves - 1
                        ELSE total_loves 
                      END,
        total_cares = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.CARE} THEN total_cares - 1
                        ELSE total_cares 
                      END,
        total_haha = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.HAHA} THEN total_haha - 1
                        ELSE total_haha 
                      END,
        total_wows = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.WOW} THEN total_wows - 1
                        ELSE total_wows 
                      END,
        total_sads = CASE 
                        WHEN ${previousReactionId} = ${ReactionTypeEnum.SAD} THEN total_sads - 1
                        ELSE total_sads 
                      END,
        total_angries = CASE 
                          WHEN ${previousReactionId} = ${ReactionTypeEnum.ANGRY} THEN total_angries - 1
                          ELSE total_angries 
                        END,
        total_reactions = CASE 
                          WHEN ${previousReactionId} IS NOT NULL THEN total_reactions - 1
                          ELSE total_reactions 
                        END
      WHERE comment_id = ?;`;

    const [resultUpdatePostReaction]: any = await connection.execute(
      sqlUpdatePostReaction,
      [userId, commentId]
    );

    let affectedRows = resultUpdatePostReaction.affectedRows;

    if (affectedRows >= 1) {
      await connection.execute(sqlUpdateTotalReactionPost, [commentId]);
    }

    await connection.commit();

    const resultAffectedRows: ResultAffectedRows = {
      isSuccess: affectedRows >= 1,
      affectedRows,
    };

    return resultAffectedRows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};
