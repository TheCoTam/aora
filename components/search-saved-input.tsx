import { Alert, Image, TextInput, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { useState } from "react";

interface SearchSavedInputProps {
  query: string;
  setQuery: (e: string) => void;
}

const SearchSavedInput = ({ query, setQuery }: SearchSavedInputProps) => {
  const [value, setValue] = useState(query);

  return (
    <View className="w-full h-16 px-4 bg-black-100 border-2 border-black-200 rounded-2xl focus:border-secondary items-center flex-row space-x-4">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={value}
        placeholder="Search for a video topic you saved!"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setValue(e)}
      />

      <TouchableOpacity
        onPress={() => {
          setQuery(value);
        }}
      >
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};
export default SearchSavedInput;
