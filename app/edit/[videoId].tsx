import { useEffect, useState } from "react";
import {
  Text,
  Alert,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import { ChevronLeft } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Button, Dialog, Portal, Switch } from "react-native-paper";

import { editPost, getPostById } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";

import FormField from "@/components/form-field";
import CustomButton from "@/components/custom-button";
import Toast from "react-native-toast-message";

export interface EditFormProps {
  $id?: string;
  title: string;
  prompt: string;
  video: ImagePicker.ImagePickerAsset | string;
  thumbnail: ImagePicker.ImagePickerAsset | string;
  isPublic: boolean;
  creator?: {
    $id: string;
    username: string;
    avatar: string;
  };
}

const EditVideo = () => {
  const { videoId } = useLocalSearchParams();

  if (!videoId) {
    router.replace("/home");
  }

  const { data, isLoading } = useAppwrite(() => getPostById(videoId));

  if ("isSuccess" in data && "message" in data && !data.isSuccess) {
    Alert.alert("Error", data.message as string);
    router.replace("/home");
    return;
  }

  const [form, setForm] = useState<EditFormProps>({
    title: "",
    prompt: "",
    video: "",
    thumbnail: "",
    isPublic: false,
  });
  const [uploading, setUploading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setForm({
      ...data,
    });
  }, [data]);

  const openPicker = async (selectType: string) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:
        selectType === "image"
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!res.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: res.assets[0] });
      }
    }
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const submit = async () => {
    setUploading(true);
    const res = await editPost(form);
    if (res.isSuccess) {
      Toast.show({
        type: "success",
        text1: "Edit Post",
        text2: "Post updated successfully",
      });
      router.push("/home");
    } else {
      Toast.show({
        type: "error",
        text1: "Edit Post",
        text2: res.message,
      });
    }
    setUploading(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        className="my-3 px-2 flex-row space-x-1 items-center"
      >
        <ChevronLeft size={20} className="text-white" />
        <Text className="text-white font-psemibold text-xs">Back</Text>
      </TouchableOpacity>
      <ScrollView className="px-4 mb-6">
        <Text className="text-2xl text-white font-psemibold">Edit Video</Text>
        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catch title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
          disabled={isLoading || uploading}
        />
        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The Prompt you used to create this video..."
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-10"
          disabled={isLoading || uploading}
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>
          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail !== "" && (
              <Image
                source={
                  typeof form.thumbnail === "string"
                    ? { uri: form.thumbnail }
                    : { uri: form.thumbnail?.uri }
                }
                className="w-full h-64 rounded-2xl"
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">Video</Text>
          <TouchableOpacity
            onPress={() => {
              showDialog();
            }}
          >
            <Video
              source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
              className="w-full h-60 rounded-2xl"
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls
            />
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Accessibility
          </Text>
          <View className="flex-row items-center justify-evenly">
            <Text
              className={
                form.isPublic
                  ? "text-white font-pregular"
                  : "text-secondary font-psemibold"
              }
            >
              Private
            </Text>
            <Switch
              value={form.isPublic}
              onValueChange={() =>
                setForm({
                  ...form,
                  isPublic: !form.isPublic,
                })
              }
            />
            <Text
              className={
                form.isPublic
                  ? "text-secondary font-psemibold"
                  : "text-white font-pregular"
              }
            >
              Public
            </Text>
          </View>
        </View>
        <CustomButton
          title="Save changes"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Opp!</Dialog.Title>
          <Dialog.Content>
            <Text className="text-white font-pregular">
              This feature is not yet complete 😭, so it cannot be used. Please
              try again later!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default EditVideo;
