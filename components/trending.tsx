import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewToken,
} from "react-native";
import * as Animatable from "react-native-animatable";
import React, { useState } from "react";
import { Models } from "react-native-appwrite";
import { Video, ResizeMode } from "expo-av";

import { icons } from "@/constants";

type Post = {
  $id: string;
  thumbnail: string;
  video: string;
};

interface TrendingProps {
  posts: Models.Document[];
}

interface TrendingItemProps {
  activeItem: string;
  item: Post;
}

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const TrendingItem = ({ activeItem, item }: TrendingItemProps) => {
  const [play, setPlay] = useState(false);

  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item.$id ? zoomIn : zoomOut}
      duration={500}
    >
      {play ? (
        <Video
          // source={{ uri: item.video }}
          source={{ uri: "https://www.w3schools.com/html/mov_bbb.mp4" }}
          className="w-52 h-72 rounded-[35px] bg-white/10"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          className="relative justify-center items-center"
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
        >
          <ImageBackground
            source={{ uri: item.thumbnail }}
            className="w-52 h-72 rounded-[35px] overflow-hidden shadow-lg shadow-black/40"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );
};

const Trending = ({ posts }: TrendingProps) => {
  if (!posts.length) {
    return <Text>No trending videos</Text>;
  }
  const [activeItem, setActiveItem] = useState(posts[0].$id);

  const viewableItemChanges = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<Models.Document>[];
  }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.$id}
      renderItem={({ item }) => (
        <TrendingItem activeItem={activeItem} item={item} />
      )}
      horizontal
      viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
      // contentOffset={{ x: 0, y: 0 }}
      onViewableItemsChanged={viewableItemChanges}
    />
  );
};

export default Trending;

const styles = StyleSheet.create({});
