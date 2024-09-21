import { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Models } from "react-native-appwrite";

import { useGlobalContext } from "@/context/global-provider";

import useAppwrite from "@/lib/useAppwrite";
import { getCurrentUserPosts, signOut } from "@/lib/appwrite";
import { icons } from "@/constants";

import EmptyState from "@/components/empty-state";
import VideoCard, { VideoCardProps } from "@/components/video-card";
import InfoBox from "@/components/info-box";
import FollowersDialog from "@/components/followers-dialog";
import { Settings } from "lucide-react-native";

const Profile = () => {
  const {
    user,
    setUser,
    setIsLoggedIn,
    refetch: refetchGlobalContext,
    isLoading: isLoadingGlobalContext,
  } = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: posts,
    refetch,
    isLoading: isLoadingAppwrite,
  } = useAppwrite(getCurrentUserPosts);

  const refetchAll = () => {
    refetchGlobalContext();
    refetch();
  };

  const onRefresh = () => {
    setRefreshing(true);
    refetchAll();
    setRefreshing(false);
  };

  const logout = async () => {
    setUser(undefined);
    setIsLoggedIn(false);
    await signOut();

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts as Models.Document[] & VideoCardProps["video"][]}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <View className="w-full mb-10 flex-row items-center justify-end space-x-4">
              <TouchableOpacity onPress={() => {}}>
                <Settings strokeWidth={2.5} className="w-6 h-6 text-blue-400" />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <Image
                  source={icons.logout}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </TouchableOpacity>
            </View>
            <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>
            <InfoBox
              title={user?.username}
              containerStyle="mt-5"
              titleStyle="text-lg"
            />
            <View className="mt-5 flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                containerStyle="mr-10"
                titleStyle="text-xl"
              />
              <FollowersDialog
                followers={user?.followers!}
                refetch={refetchAll}
                isLoading={isLoadingGlobalContext || isLoadingAppwrite}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Videos found"
            subtitle="Try refreshing or adding a new video."
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Profile;
