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
    console.log(error);
    throw new Error("Failed to create user");
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return { isSuccess: true, session };
  } catch (error) {
    console.log(error);
    return { isSuccess: false, message: "Invalid email or password" };
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) {
      throw Error;
    }

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) {
      throw Error;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(3)]
    );

    return posts.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getPostById = async (postId: string | string[]) => {
  const searchQuery = Array.isArray(postId) ? postId[0] : postId;

  try {
    const post = await databases.getDocument(
      databaseId,
      videosCollectionId,
      searchQuery
    );

    return post;
  } catch (error) {
    console.log(error);
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

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error");
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const posts = await databases.listDocuments(
      databaseId,
      videosCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    return posts.documents;
  } catch (error) {
    console.log(error);
    throw new Error("Internal server error");
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { isSuccess: false, message: "User not found" };
  }

  if (currentUser?.$id !== form.creator.$id) {
    return { isSuccess: false, message: "Unauthorized" };
  }

  try {
    const prevPost = await getPostById(form.$id);

    if (prevPost?.isSuccess === false) {
      return { isSuccess: false, message: "Post not found" };
    }

    const fileId = fileIdExtractor(prevPost.thumbnail);

    if (!fileId) {
      return { isSuccess: false, message: "File Id not found" };
    }

    const newThumbnailUrl = await uploadFile(form.thumbnail, "image");

    await databases.updateDocument(databaseId, videosCollectionId, form.$id, {
      title: form.title,
      prompt: form.prompt,
      thumbnail: newThumbnailUrl,
      isPublic: form.isPublic,
    });

    await storage.deleteFile(storageId, fileId);

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
  return followers.toString();
};

export const changeUserFollowers = async (followers: number) => {
  const currentUser = await getCurrentUser();

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
