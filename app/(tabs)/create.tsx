import {
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";

import { icons } from "@/constants";

import FormField from "@/components/form-field";
import CustomButton from "@/components/custom-button";
import { router } from "expo-router";
import { createPost } from "@/lib/appwrite";
import { useGlobalContext } from "@/context/global-provider";

export interface CreateFormProps {
  title: string;
  prompt: string;
  video: DocumentPicker.DocumentPickerAsset | null;
  thumbnail: DocumentPicker.DocumentPickerAsset | null;
  userId: string;
}

const Create = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<CreateFormProps>({
    title: "",
    video: null,
    thumbnail: null,
    prompt: "",
    userId: "",
  });

  const openPicker = async (selectType: string) => {
    const res = await DocumentPicker.getDocumentAsync({
      type: selectType === "image" ? ["image/*"] : ["video/mp4", "video/gif"],
    });

    if (!res.canceled) {
      if (selectType === "image") {
        setForm({ ...form, thumbnail: res.assets[0] });
      }

      if (selectType === "video") {
        setForm({ ...form, video: res.assets[0] });
      }
    }
  };

  const submit = async () => {
    if (
      form.title === "" ||
      form.prompt === "" ||
      !form.video ||
      !form.thumbnail
    ) {
      Alert.alert("Error", "Please fill in all the fields");
      return;
    }
    setUploading(true);
    try {
      await createPost({ ...form, userId: user?.$id! });

      Alert.alert("Success", "Post uploaded successfully!");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error as string);
    } finally {
      setForm({
        title: "",
        video: null,
        thumbnail: null,
        prompt: "",
        userId: "",
      });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Upload Videos
        </Text>
        <FormField
          title="Video Title"
          value={form.title}
          placeholder="Give your video a catch title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Video
          </Text>
          <TouchableOpacity onPress={() => openPicker("video")}>
            {form.video ? (
              <Video
                source={{ uri: form.video.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center  items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Thumbnail Image
          </Text>
          <TouchableOpacity onPress={() => openPicker("image")}>
            {form.thumbnail ? (
              <Image
                source={{ uri: form.thumbnail.uri }}
                className="w-full h-64 rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2">
                <Image
                  source={icons.upload}
                  resizeMode="contain"
                  className="w-5 h-5"
                />
                <Text className="text-sm text-gray-100 font-pmedium">
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <FormField
          title="AI Prompt"
          value={form.prompt}
          placeholder="The Prompt you used to create this video"
          handleChangeText={(e) => setForm({ ...form, prompt: e })}
          otherStyles="mt-7"
        />
        <CustomButton
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
