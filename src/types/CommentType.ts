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
  content: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  media_type_id: number;
  media_url: number;
  total_replies: number;
};

export type DeleteCommentType = {
  comment_id: number;
  user_id: number;
};
