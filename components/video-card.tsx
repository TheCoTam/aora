import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import {
  BookmarkCheck,
  EllipsisVertical,
  Pencil,
  Trash2,
} from "lucide-react-native";

import { icons } from "@/constants";
import CustomMenu from "./custom-menu";
import { Href, router } from "expo-router";
import { getCurrentUser } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useDeletePostContext } from "@/context/delete-post-provider";
import { VideoCardMenu } from "./video-card-menu";

export interface VideoCardProps {
  video: {
    $id: string;
    title: string;
    thumbnail: string;
    video: string;
    creator: {
      $id: string;
      username: string;
      avatar: string;
    };
  };
  refetch: () => Promise<void>;
}

const VideoCard = ({ video, refetch }: VideoCardProps) => {
  const { showDialog, setPostId } = useDeletePostContext();
  const { title, thumbnail, creator } = video;

  const [play, setPlay] = useState(false);
  const { data } = useAppwrite(getCurrentUser);

  const isEditable = data.$id === creator.$id;

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row gap-3 items-start">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            <Image
              source={{ uri: creator.avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-white font-psemibold text-sm"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {creator.username}
            </Text>
          </View>
        </View>
        <VideoCardMenu postId={video.$id} />
      </View>

      {play ? (
        <Video
          // source={{ uri: video.video }}
          source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
          className="w-full h-60 rounded-xl"
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          useNativeControls
          onPlaybackStatusUpdate={(status) => {
            if ("didJustFinish" in status && status.didJustFinish) {
              setPlay(false);
            }
          }}
          onError={(error) => {
            console.log(error);
            Alert.alert("Error", "An error occurred while playing the video");
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
