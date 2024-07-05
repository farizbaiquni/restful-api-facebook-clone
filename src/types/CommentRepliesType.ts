export type AddCommentReplyType = {
  user_id: number;
  post_id: number;
  parent_comment_id: number;
  tag_id_user_parent_comment: number;
  tag_name_user_parent_comment: string | null;
  content: string;
};
