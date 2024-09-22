import { Models } from "react-native-appwrite";

type User = {
  $id: string;
  username: string;
  email: string;
  avatar: string;
  accountId: string;
  followers: number;
  savedPosts: string[];
};

export default User;
