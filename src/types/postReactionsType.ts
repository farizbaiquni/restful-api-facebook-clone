export type GetTop3PostReactionsType = {
  reaction_id: number;
  reaction_name: string;
  total_count: number;
};

export type GetPostReactionType = {
  post_reaction_id: number;
  user_id: number;
  post_id: number;
  reaction_id: number;
  reaction_name: string;
};

export type AddPostReactionType = {
  user_id: number;
  post_id: number;
  reaction_id: number;
};

export type DeletePostReactionType = {
  user_id: number;
  post_id: number;
};
