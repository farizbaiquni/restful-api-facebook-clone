import { getConnection } from "../configs/database";
import { ReactionTypeEnum } from "../types/ReactionType";
import { ResultAffectedRows } from "../types/Responses";

export const getTop3PostReactionsModel = async (post_id: number) => {
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
  let connection;
  try {
    connection = await getConnection();
    return await connection.execute(sqlQuery, [post_id]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const getPostReactionModel = async (userId: number, postId: number) => {
  const sqlQuery = `
    SELECT pr.post_reaction_id, pr.user_id, pr.post_id, pr.reaction_id, rt.reaction_name
    FROM post_reactions pr
    JOIN reaction_type rt ON pr.reaction_id = rt.reaction_id
    WHERE pr.user_id = ? AND pr.post_id = ? AND pr.is_deleted = 0;`;

  let connection;
  try {
    connection = await getConnection();
    return await connection.execute(sqlQuery, [userId, postId]);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

export const addOrUpdatePostReactionModel = async (
  userId: number,
  postId: number,
  reactionId: number
) => {
  const sqlUpdatePostReaction = `
    INSERT INTO 
      post_reactions (user_id, post_id, reaction_id) 
    VALUES (?, ?, ?) 
    ON DUPLICATE KEY UPDATE reaction_id = VALUES(reaction_id), is_deleted = 0, deleted_at = NULL;
  `;

  const sqlPreviousReaction = `
    SELECT reaction_id
    FROM post_reactions
    WHERE user_id = ? AND post_id = ? AND is_deleted = 0
    FOR UPDATE
  `;

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    // Mengunci baris yang dipilih dengan FOR UPDATE
    const [previousReactionRows]: any = await connection.execute(
      sqlPreviousReaction,
      [userId, postId]
    );

    const previousReactionId =
      previousReactionRows.length > 0
        ? previousReactionRows[0].reaction_id
        : null;

    const sqlUpdateTotalReactionPost = `
      UPDATE posts
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
      WHERE post_id = ?;`;

    const [resultUpdatePostReaction]: any = await connection.execute(
      sqlUpdatePostReaction,
      [userId, postId, reactionId]
    );

    let affectedRows = resultUpdatePostReaction.affectedRows;

    if (affectedRows >= 1) {
      await connection.execute(sqlUpdateTotalReactionPost, [postId]);
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

export const deletePostReactionModel = async (
  userId: number,
  postId: number
) => {
  const sqlUpdatePostReaction = `
    UPDATE post_reactions 
    SET is_deleted = 1, deleted_at = NOW() 
    WHERE user_id = ? AND post_id = ? AND is_deleted = 0;`;

  const sqlPreviousReaction = `
    SELECT reaction_id
    FROM post_reactions
    WHERE user_id = ? AND post_id = ? AND is_deleted = 0
    FOR UPDATE;
  `;

  let connection;

  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const [previousReactionRows]: any = await connection.execute(
      sqlPreviousReaction,
      [userId, postId]
    );
    const previousReactionId =
      previousReactionRows.length > 0
        ? previousReactionRows[0].reaction_id
        : null;

    const sqlUpdateTotalReactionPost = `
      UPDATE posts
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
                          WHEN ${previousReactionId} IS NOT NULL THEN total_reactions + 1
                          ELSE total_reactions 
                        END
      WHERE post_id = ?;`;

    const [resultUpdatePostReaction]: any = await connection.execute(
      sqlUpdatePostReaction,
      [userId, postId]
    );

    let affectedRows = resultUpdatePostReaction.affectedRows;

    if (affectedRows >= 1) {
      await connection.execute(sqlUpdateTotalReactionPost, [postId]);
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
