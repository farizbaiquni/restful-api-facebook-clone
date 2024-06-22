import { MediaTableType } from "./MediaType";

export type AddPostType = {
  user_id: number;
  content: string;
  emoji?: string;
  activity_icon_url?: string;
  gif_url?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  audience_type_id: number;
};

type MediaPostType = {
  media_type_id: number;
  media_url: string;
};

type ReactionsType = {
  like: number;
  love: number;
  care: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
  total: number;
};

export type GetPostType = {
  post_id: number;
  user_id: number;
  content: string;
  emoji: string | null;
  activity_icon_url: string | null;
  gif_url: string | null;
  latitude: string | null;
  longitude: string | null;
  location_name: string | null;
  audience_type_id: number;
  first_name: string;
  last_name: string;
  profile_picture: string;
  created_at: string;
  updated_at: string;
  media: MediaPostType[];
  reactions: ReactionsType;
  total_comments: number;
  total_shares: number;
};

export type DeletePostType = {
  post_id: number;
  user_id: number;
};

export type UndoDeletePostType = {
  post_id: number;
  user_id: number;
};

export type UndoDeleteMultiplePostsType = {
  post_id_array: number[];
  user_id: number;
};
