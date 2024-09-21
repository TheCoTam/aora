import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchSavedInput from "@/components/search-saved-input";
import { getBookmarkedPosts } from "@/lib/appwrite";
import EmptyState from "@/components/empty-state";
import VideoCard, { VideoCardProps } from "@/components/video-card";

const Bookmark = () => {
  // const { data, isLoading, refetch } = useAppwrite(getBookmarkedPosts);
  const [data, setData] = useState<VideoCardProps["video"][] | null>(null);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const res = await getBookmarkedPosts(query);

    if ("isSuccess" in res && res.isSuccess === false) {
      setData(null);
      Alert.alert("Error", res.message);
      return;
    } else {
      setData(res);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  console.log(query);

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={data}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="my-6 px-4">
            <Text className="text-3xl text-white font-psemibold mb-4">
              Saved Videos
            </Text>
            <SearchSavedInput query={query} setQuery={setQuery} />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No bookmarked posts"
            subtitle="Try bookmarking some videos to see them here."
            noButton
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
