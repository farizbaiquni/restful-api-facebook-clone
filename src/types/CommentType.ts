export type AddCommentType = {
  post_id: number;
  parent_comment_id: number;
  user_id: number;
  content: string;
};

export type GetCommentType = {
  comment_id: number;
  post_id: number;
  parent_comment_id: number | null;
  user_id: number;
  content: string | null;
  is_deleted: boolean;
  deleted_at: string;
  total_reactions: number;
  total_replies: number;
  total_shares: number;
  total_likes: number;
  total_loves: number;
  total_haha: number;
  total_wows: number;
  total_sads: number;
  total_angries: number;
  created_at: string;
  updated_at: string;
  comment_media_id: number;
  media_type_id: number;
  media_url: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
};

export type DeleteCommentType = {
  comment_id: number;
  user_id: number;
};

export type UpdateCommentType = {
  commentId: number;
  userId: number;
  content: string;
  media_type_id: number | null;
  media_url: string | null;
};
