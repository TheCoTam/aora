import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";

import useAppwrite from "@/lib/useAppwrite";
import {
  changeUserFollowers,
  formatFollowers,
  getCurrentUser,
} from "@/lib/appwrite";

import InfoBox from "./info-box";
import Toast from "react-native-toast-message";

interface FollowersDialogProps {
  followers: number;
  refetch: () => void;
  isLoading: boolean;
}

const FollowersDialog = ({
  followers: initialFollowers,
  refetch,
  isLoading,
}: FollowersDialogProps) => {
  const [visible, setVisible] = useState(false);
  const [followers, setFollowers] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const changeFollowers = async () => {
    if (!followers) {
      Alert.alert("Error", "Please enter the number of followers");
      return;
    }

    setLoading(true);
    const res = await changeUserFollowers(parseInt(followers));
    setLoading(false);
    if (res.isSuccess) {
      Toast.show({
        type: "success",
        text1: "Change Followers",
        text2: "Followers changed successfully",
      });
      setFollowers(undefined);
      hideDialog();
      await refetch();
    } else {
      Toast.show({
        type: "error",
        text1: "Change Followers",
        text2: res.message,
      });
    }
  };

  return (
    <View>
      {isLoading ? (
        <Button loading>Followers</Button>
      ) : (
        <TouchableOpacity onPress={showDialog}>
          <InfoBox
            title={formatFollowers(initialFollowers)}
            subtitle="Followers"
            titleStyle="text-xl"
          />
        </TouchableOpacity>
      )}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Change Followers</Dialog.Title>
          <Dialog.Content>
            <Text className="text-white font-pregular mb-1">
              Your current followers: {initialFollowers}
            </Text>
            <Text className="text-white font-pregular mb-4">
              The number of followers you want?
            </Text>
            <View className="w-full h-12 px-4 bg-black-100/30 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row">
              <TextInput
                className="flex-1 text-white font-psemibold text-base"
                value={followers}
                onChangeText={(e) => setFollowers(e)}
                keyboardType="numeric"
                placeholder="1M Followers"
                placeholderTextColor="#7b7b8b"
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} disabled={loading}>
              Cancel
            </Button>
            <Button
              onPress={changeFollowers}
              disabled={followers === undefined || loading}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default FollowersDialog;
