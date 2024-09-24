import * as ImagePicker from "expo-image-picker";

import { CreateFormProps } from "@/app/(tabs)/create";
import {
  Account,
  Avatars,
  Client,
  Databases,
  Storage,
  ID,
  Query,
  ImageGravity,
  Models,
} from "react-native-appwrite";
import { EditFormProps } from "@/app/edit/[videoId]";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.thecotam.aora",
  projectId: "66e300480022b4e4b12d",
  databaseId: "66e301ff0005d0c5a271",
  userCollectionId: "66e3024900129a61fdf7",
  videosCollectionId: "66e3025f0026d77e33ec",
  storageId: "66e304a000211f6fcd46",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videosCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(endpoint) // Your Appwrite Endpoint
  .setProject(projectId) // Your project ID
  .setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) {
      throw Error;
    }

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log("[appwrite/createUser]", error);
    throw new Error("Failed to create user");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return { isSuccess: true, session };
  } catch (error) {
    console.log("[appwrite/signIn]", error);
    return { isSuccess: false, message: "Invalid email or password" };
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      return { isSuccess: false, message: "Account not found" };
    }

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      return { isSuccess: false, message: "User not found" };
    }

    return { isSuccess: true, data: currentUser.documents[0] };
  } catch (error) {
    console.log("[appwrite/getCurrentUser]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt"), Query.equal("isPublic", true)]
    );

    return { isSuccess: true, data: posts.documents };
  } catch (error) {
    console.log("[appwrite/getAllPosts]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [
        Query.orderDesc("$createdAt"),
        Query.limit(3),
        Query.equal("isPublic", true),
      ]
    );

    return { isSuccess: true, data: posts.documents };
  } catch (error) {
    console.log("[appwrite/getLatestPosts]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const getPostById = async (
  postId: string | string[]
): Promise<
  | Models.Document
  | {
      isSuccess: boolean;
      data?: Models.Document;
      message?: string;
      thumbnail?: string;
      video?: string;
    }
> => {
  const searchQuery = Array.isArray(postId) ? postId[0] : postId;

  try {
    const post = await databases.getDocument(
      databaseId,
      videosCollectionId,
      searchQuery
    );

    return { isSuccess: true, data: post };
  } catch (error) {
    console.log("[appwrite/getPostById]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const searchPosts = async (query: string | string[]) => {
  const searchQuery = Array.isArray(query) ? query[0] : query;

  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.search("title", searchQuery)]
    );

    return { isSuccess: true, data: posts.documents };
  } catch (error) {
    console.log("[appwrite/searchPosts]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const getCurrentUserPosts = async () => {
  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) {
    return { isSuccess: false, message: "User not found" };
  }

  const userId = currentUser.$id;

  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return { isSuccess: true, data: posts.documents };
  } catch (error) {
    console.log("[appwrite/getUserPosts]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log("[appwrite/signOut]", error);
    throw new Error("Something went wrong");
  }
};

export const getFilePreview = async (fileId: string, type: string) => {
  let fileUrl;

  try {
    if (type === "image") {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        ImageGravity.Top,
        100
      );
    } else if (type === "video") {
      fileUrl = storage.getFilePreview(storageId, fileId);
    } else {
      console.log("Invalid file type");
      return null;
    }

    if (!fileUrl) {
      console.log("fileUrl not found");
      return null;
    }

    return fileUrl;
  } catch (error) {
    console.log("[appwrite/getFilePreview]", error);
    return null;
  }
};

export const uploadFile = async (
  file: ImagePicker.ImagePickerAsset | string,
  type: string
) => {
  if (!file || typeof file === "string") {
    console.log("File not found");
    return null;
  }

  const asset = {
    name: file.fileName!,
    type: file.mimeType!,
    size: file.fileSize!,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (error) {
    console.log("[appwrite/uploadFile]", error);
    return null;
  }
};

export const createPost = async (form: CreateFormProps) => {
  const { thumbnail, video, title, prompt, userId } = form;

  try {
    const videoUrl = await uploadFile(video, "video");
    if (!videoUrl) {
      return { isSuccess: false, message: "Failed to upload video!" };
    }

    const thumbnailUrl = await uploadFile(thumbnail, "image");
    if (!thumbnailUrl) {
      return { isSuccess: false, message: "Failed to upload thumbnail!" };
    }

    const newPost = await databases.createDocument(
      databaseId,
      videosCollectionId,
      ID.unique(),
      {
        title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt,
        creator: userId,
      }
    );

    return { isSuccess: true, data: newPost };
  } catch (error) {
    console.log("[appwrite/createPosts]", error);
    return { isSuccess: false, message: "Internal server error." };
  }
};

export const fileIdExtractor = (url: string) => {
  const regex = /files\/(.*?)\/preview/;
  const match = url.match(regex);

  return match ? match[1] : null;
};

export const editPost = async (form: EditFormProps) => {
  const { data: currentUser } = await getCurrentUser();

  if (!currentUser) {
    return { isSuccess: false, message: "User not found" };
  }

  if (currentUser?.$id !== form.creator?.$id) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    const { data: prevPost } = await getPostById(form.$id!);

    if (prevPost?.isSuccess === false) {
      return { isSuccess: false, message: "Post not found" };
    }

    const hasNewThumbnail = form.thumbnail !== prevPost.thumbnail;
    let fileId, newThumbnailUrl;

    if (hasNewThumbnail) {
      fileId = fileIdExtractor(prevPost.thumbnail);

      if (!fileId) {
        return { isSuccess: false, message: "File Id not found" };
      }

      newThumbnailUrl = await uploadFile(form.thumbnail, "image");
      await storage.deleteFile(storageId, fileId);
    }

    await databases.updateDocument(databaseId, videosCollectionId, form.$id!, {
      title: form.title,
      prompt: form.prompt,
      thumbnail: hasNewThumbnail ? newThumbnailUrl : form.thumbnail,
      isPublic: form.isPublic,
    });

    return { isSuccess: true };
  } catch (error) {
    console.log("[appwrite/editPost]", error);
    return { isSuccess: false, message: "Internal server error." };
  }
};

export const formatFollowers = (followers: number): string => {
  if (followers >= 1e9) {
    const followersInBillion = followers / 1e9;
    if (followersInBillion < 10) {
      return followersInBillion.toFixed(2) + "B";
    }
    if (followersInBillion < 100) {
      return followersInBillion.toFixed(1) + "B";
    }
    return followersInBillion.toFixed(0) + "B";
  }
  if (followers >= 1e6) {
    const followersInMillion = followers / 1e6;
    if (followersInMillion < 10) {
      return followersInMillion.toFixed(2) + "M";
    }
    if (followersInMillion < 100) {
      return followersInMillion.toFixed(1) + "M";
    }
    return followersInMillion.toFixed(0) + "M";
  }
  if (followers >= 1e3) {
    const followersInThousand = followers / 1e3;
    if (followersInThousand < 10) {
      return followersInThousand.toFixed(2) + "K";
    }
    if (followersInThousand < 100) {
      return followersInThousand.toFixed(1) + "K";
    }
    return followersInThousand.toFixed(0) + "K";
  }
  return followers?.toString();
};

export const changeUserFollowers = async (followers: number) => {
  const { data: currentUser } = await getCurrentUser();

  if (!currentUser) {
    return { isSuccess: false, message: "User not found" };
  }

  try {
    await databases.updateDocument(
      databaseId,
      userCollectionId,
      currentUser.$id,
      {
        followers,
      }
    );

    return { isSuccess: true };
  } catch (error) {
    console.log("[appwrite/changeFollowers]", error);
    return { isSuccess: false, message: "Internal server error." };
  }
};

export const deletePostById = async (postId: string | null) => {
  if (!postId) {
    return { isSuccess: false, message: "Post not found" };
  }

  try {
    const { data: post } = await getPostById(postId);

    if (post.isSuccess === false) {
      return { isSuccess: false, message: post.message };
    }

    const thumbnailFileId = fileIdExtractor(post.thumbnail);
    if (!thumbnailFileId) {
      return { isSuccess: false, message: "Thumbnail file not found" };
    }
    const videoFileId = fileIdExtractor(post.video);
    if (!videoFileId) {
      return { isSuccess: false, message: "Video file not found" };
    }

    await storage.deleteFile(storageId, thumbnailFileId);
    await storage.deleteFile(storageId, videoFileId);
    await databases.deleteDocument(databaseId, videosCollectionId, postId);

    return { isSuccess: true };
  } catch (error) {
    console.log("[appwrite/deletePostById]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const bookmarkPostById = async (postId: string) => {
  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) {
    return { isSuccess: false, message: "User not found!" };
  }

  try {
    const userId = currentUser.$id;
    const savedPosts = currentUser.savedPosts || [];

    if (savedPosts.includes(postId)) {
      const newSavedPosts = savedPosts.filter(
        (item: string) => item !== postId
      );

      await databases.updateDocument(databaseId, userCollectionId, userId, {
        savedPosts: newSavedPosts,
      });

      return { isSuccess: true, message: "Deleted Post from Bookmark!" };
    }

    await databases.updateDocument(databaseId, userCollectionId, userId, {
      savedPosts: [...savedPosts, postId],
    });

    return { isSuccess: true, message: "Added Post to Bookmark!" };
  } catch (error) {
    console.log("[appwrite/bookmarkPostById]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const getBookmarkedPosts = async (query: string) => {
  const { data: currentUser } = await getCurrentUser();

  if (!currentUser) {
    return { isSuccess: false, message: "User not found!" };
  }

  const savedPosts = currentUser.savedPosts;

  const queries = [
    Query.contains("$id", savedPosts),
    Query.equal("isPublic", true),
  ];
  if (query !== "") {
    queries.push(Query.search("title", query));
  }

  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      queries
    );

    return posts.documents;
  } catch (error) {
    console.log("[appwrite/getBookmarkedPosts]", error);
    return { isSuccess: false, message: "Internal server error" };
  }
};

export const isEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const changeUserData = async (
  type: string,
  value: string,
  subValue?: string
) => {
  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) {
    return { isSuccess: false, message: "User not found" };
  }

  const userId = currentUser.$id;
  let finalValue: string | number = value;

  if (type === "username") {
    account.updateName(value);
  }

  if (type === "email") {
    if (!isEmail(value)) {
      return { isSuccess: false, message: "Invalid email address!" };
    }

    if (!subValue) {
      return { isSuccess: false, message: "Your password is required!" };
    }

    try {
      await account.updateEmail(value, subValue);
    } catch (error) {
      console.log("[appwrite/changeUserData/changeEmail]", error);
      return { isSuccess: false, message: "Something went wrong!" };
    }
  }

  if (type === "followers") {
    finalValue = parseInt(value);
  }

  if (type === "password") {
    if (!subValue) {
      return { isSuccess: false, message: "Your old password is required!" };
    }

    try {
      await account.updatePassword(value, subValue);

      return { isSuccess: true };
    } catch (error) {
      console.log("[appwrite/changeUserData/changePassword]", error);
      return { isSuccess: false, message: "Something went wrong!" };
    }
  }

  try {
    await databases.updateDocument(databaseId, userCollectionId, userId, {
      [type]: finalValue,
    });

    return { isSuccess: true };
  } catch (error) {
    console.log("[appwrite/changeUserData]", error);
    return { isSuccess: false, message: "Internal server error." };
  }
};
