export type GetCommentReactionType = {
  comment_reaction_id: number;
  user_id: number;
  comment_id: number;
  reaction_id: number;
  reaction_name: string;
};

export type AddCommentReactionType = {
  user_id: number;
  comment_id: number;
  reaction_id: number;
};

export type DeleteCommentReactionType = {
  user_id: number;
  comment_id: number;
};
