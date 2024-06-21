export type CommentTableType = {
  post_id: number;
  parent_comment_id: number;
  user_id: number;
  content: string;
};

export type CommentMedia = {
  comment_media_id: number;
  media_type_id: number;
  media_url: string;
};

export type GetCommentsType = {
  comment_id: number;
  post_id: number;
  parent_comment_id: number | null;
  user_id: number;
  content: string;
  created_at: Date;
  updated_at: Date;
  media: CommentMedia | null;
  total_replies: number;
};
