import { Alert, Image, TextInput, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { router, usePathname } from "expo-router";
import { useState } from "react";

interface SearchSavedInputProps {
  initialQuery?: string | string[];
}

const SearchSavedInput = ({ initialQuery }: SearchSavedInputProps) => {
  const q = Array.isArray(initialQuery) ? initialQuery[0] : initialQuery;
  const pathname = usePathname();
  const [query, setQuery] = useState<string>(q || "");

  return (
    <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder="Search for a video topic you saved!"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
      />

      <TouchableOpacity
        onPress={() => {
          if (!query) {
            Alert.alert(
              "Missing query",
              "Please input something to search results across database."
            );
          }

          if (pathname.startsWith("/search")) router.setParams({ query });
          else router.push(`/search/${query}`);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};
export default SearchSavedInput;
