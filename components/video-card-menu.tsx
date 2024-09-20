import { Href, router } from "expo-router";
import {
  BookmarkCheck,
  EllipsisVertical,
  HeartOff,
  Pencil,
  Trash2,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Menu } from "react-native-paper";

import { useDeletePostContext } from "@/context/delete-post-provider";
import { bookmarkPostById } from "@/lib/appwrite";

type Props = {
  postId: string;
  isEditable: boolean;
  isBookmarked: boolean;
  refetch: () => Promise<void>;
};
export const VideoCardMenu = ({
  postId,
  isEditable,
  isBookmarked,
  refetch,
}: Props) => {
  const { showDialog, setPostId } = useDeletePostContext();

  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSavePost = async () => {
    setIsLoading(true);
    const res = await bookmarkPostById(postId);
    Toast.show({
      type: res.isSuccess ? "success" : "error",
      text1: "Bookmark Post",
      text2: res.message,
    });
    setIsLoading(false);
    closeMenu();
    await refetch();
  };

  const handleEdit = () => {
    closeMenu();
    router.push(`/edit/${postId}` as Href<string>);
  };

  const handleDelete = () => {
    closeMenu();
    setPostId(postId);
    showDialog();
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Button onPress={openMenu} className="mt-2 p-1.5">
          <EllipsisVertical size={25} className="text-white" />
        </Button>
      }
    >
      <Menu.Item
        onPress={handleSavePost}
        title={
          isLoading ? (
            <View className="justify-center items-center opacity-50">
              <Button loading>Bookmark</Button>
            </View>
          ) : (
            <View className="flex-row items-center space-x-1.5">
              {isBookmarked ? (
                <>
                  <HeartOff className="text-white" />
                  <Text className="text-white">Unbookmark</Text>
                </>
              ) : (
                <>
                  <BookmarkCheck className="text-white" />
                  <Text className="text-white">Bookmark</Text>
                </>
              )}
            </View>
          )
        }
        disabled={isLoading}
      />
      {isEditable && (
        <Menu.Item
          onPress={handleEdit}
          title={
            <View
              className={`flex-row items-center space-x-1.5 ${
                isLoading && "opacity-50"
              }`}
            >
              <Pencil className="text-white" />
              <Text className="text-white">Edit</Text>
            </View>
          }
          disabled={isLoading}
        />
      )}
      {isEditable && (
        <Menu.Item
          onPress={handleDelete}
          title={
            <View
              className={`flex-row items-center space-x-1.5 ${
                isLoading && "opacity-50"
              }`}
            >
              <Trash2 className="text-white" />
              <Text className="text-white">Delete</Text>
            </View>
          }
          disabled={isLoading}
        />
      )}
    </Menu>
  );
};
