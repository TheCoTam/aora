import { View, Text, FlatList } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchSavedInput from "@/components/search-saved-input";

const Bookmark = () => {
  return (
    <SafeAreaView className="bg-primary h-full">
      <View className="my-6 px-4">
        <Text className="text-3xl text-white font-psemibold mb-4">
          Saved Videos
        </Text>
        <SearchSavedInput />
      </View>
    </SafeAreaView>
  );
};

export default Bookmark;
