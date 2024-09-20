import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import InfoBox from "./info-box";
import useAppwrite from "@/lib/useAppwrite";
import {
  changeUserFollowers,
  formatFollowers,
  getCurrentUser,
} from "@/lib/appwrite";

interface FollowersDialogProps {
  refetch: () => Promise<void>;
}

const FollowersDialog = ({ refetch }: FollowersDialogProps) => {
  const { data } = useAppwrite(getCurrentUser);

  if (!data) {
    return null;
  }

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
    await changeUserFollowers(parseInt(followers));

    setFollowers(undefined);
    setLoading(false);
    hideDialog();
    await refetch();
  };

  return (
    <View>
      <TouchableOpacity onPress={showDialog}>
        <InfoBox
          title={formatFollowers(data.followers || 0)}
          subtitle="Followers"
          titleStyle="text-xl"
        />
      </TouchableOpacity>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Change Followers</Dialog.Title>
          <Dialog.Content>
            <Text className="text-white font-pregular mb-1">
              Your current followers: {data.followers || 0}
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
            <Button onPress={hideDialog}>Cancel</Button>
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
