import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";

import useAppwrite from "@/lib/useAppwrite";
import { getCurrentUser } from "@/lib/appwrite";

import { SettingsFormField } from "@/components/settings-form-field";

const Settings = () => {
  const { data, refetch } = useAppwrite(getCurrentUser);

  return (
    <SafeAreaView className="bg-primary h-full">
      <TouchableOpacity
        className="flex-row items-center my-2 px-2"
        onPress={() => {
          router.back();
        }}
      >
        <ChevronLeft className="text-white w-6 h-6" />
        <Text className="text-white font-psemibold text-sm">Back</Text>
      </TouchableOpacity>
      <ScrollView className="my-5 flex-1 space-y-3">
        <Text className="text-white font-pbold text-4xl py-0.5 text-center">
          Settings
        </Text>
        <View className="px-6">
          <SettingsFormField
            title="Username"
            value={data.username}
            type="username"
            refetch={refetch}
          />
          <SettingsFormField
            title="Email"
            value={data.email}
            type="email"
            refetch={refetch}
          />
          <SettingsFormField
            title="Password"
            value="********"
            type="password"
            refetch={refetch}
          />
          <SettingsFormField
            title="Avatar"
            value={data.avatar}
            type="avatar"
            refetch={refetch}
          />
          <SettingsFormField
            title="Followers"
            value={data.followers}
            type="followers"
            refetch={refetch}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
