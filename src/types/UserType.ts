export type UserType = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  salt: string;
  profile_picture: string | null;
  cover_photo: string | null;
  bio: string | null;
  birth_date: string;
  gender_id: string | null;
};

export type loginModelType = {
  user_id: string;
  email: string;
  password: string;
  salt: string;
};
