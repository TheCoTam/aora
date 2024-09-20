import { deletePostById } from "@/lib/appwrite";
import { createContext, useContext, useState } from "react";
import { Text } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import Toast from "react-native-toast-message";

interface DeletePostContextType {
  showDialog: () => void;
  setPostId: (postId: string) => void;
}

const DeletePostContext = createContext<DeletePostContextType | undefined>(
  undefined
);

const DeletePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deletePostById(postId);
    if (res.isSuccess === false) {
      Toast.show({
        type: "error",
        text1: "Delete Post",
        text2: res.message,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Delete Post",
        text2: "Post deleted successfully",
      });
    }
    setIsLoading(false);
    hideDialog();
  };

  return (
    <DeletePostContext.Provider value={{ showDialog, setPostId }}>
      {children}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Delete Post</Dialog.Title>
          <Dialog.Content>
            <Text className="text-white font-pregular">
              Are you sure you want to delete this post?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={handleDelete}
              buttonColor="#f87171"
              textColor="#000000"
              disabled={isLoading}
            >
              Confirm
            </Button>
            <Button onPress={hideDialog} disabled={isLoading}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </DeletePostContext.Provider>
  );
};

export default DeletePostProvider;

export const useDeletePostContext = () => {
  const context = useContext(DeletePostContext);

  if (!context) {
    throw new Error(
      "useDeletePostContext must be used within a DeletePostProvider"
    );
  }

  return context;
};
