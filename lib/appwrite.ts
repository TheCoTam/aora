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
  file: ImagePicker.ImagePickerAsset | null,
  type: string
) => {
  if (!file) {
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
