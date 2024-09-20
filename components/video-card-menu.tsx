import { useDeletePostContext } from "@/context/delete-post-provider";
import { bookmarkPostById } from "@/lib/appwrite";
import { Href, router } from "expo-router";
import {
  BookmarkCheck,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Menu } from "react-native-paper";
import Toast from "react-native-toast-message";

type Props = {
  postId: string;
};
export const VideoCardMenu = ({ postId }: Props) => {
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
            <View className="justify-center items-center">
              <Button loading>Bookmark</Button>
            </View>
          ) : (
            <View className="flex-row items-center space-x-1.5">
              <BookmarkCheck className="text-white" />
              <Text className="text-white">Bookmark</Text>
            </View>
          )
        }
      />
      <Menu.Item
        onPress={handleEdit}
        title={
          <View className="flex-row items-center space-x-1.5">
            <Pencil className="text-white" />
            <Text className="text-white">Edit</Text>
          </View>
        }
      />
      <Menu.Item
        onPress={handleDelete}
        title={
          <View className="flex-row items-center space-x-1.5">
            <Trash2 className="text-white" />
            <Text className="text-white">Delete</Text>
          </View>
        }
      />
    </Menu>
  );
};
