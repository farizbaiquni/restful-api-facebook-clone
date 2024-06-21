export type MediaTableType = {
  post_id: number;
  media_type_id: string;
  media_url: string;
};

export type CommentMediaTableType = {
  comment_id: number;
  media_type_id: number;
  media_url: string;
};
