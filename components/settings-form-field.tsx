import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { Eye, EyeOff, Pencil, X } from "lucide-react-native";

import { changeUserData } from "@/lib/appwrite";

type Props = {
  title: string;
  value: string;
  type: string;
  refetch: () => Promise<void>;
  // handleSaveValue: () => Promise<void>;
};
export const SettingsFormField = ({
  title,
  value,
  type,
  refetch,
}: // handleSaveValue,
Props) => {
  const isAvatarForm = type === "avatar";
  const isPasswordForm = type === "password";
  const isEmailForm = type === "email";
  const isValueNotString = type === "followers";

  const currentPasswordInputVisible = isPasswordForm || isEmailForm;
  const defaultValue = isPasswordForm ? "" : value;

  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState<string>(defaultValue || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSaveButtonDisabled = isPasswordForm
    ? newValue === "" || confirmPassword === "" || isLoading
    : newValue === "" || newValue === value || isLoading;

  const handlePress = async () => {
    if (isPasswordForm && newValue !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Change Password",
        text2: "Passwords do not match!",
      });
      return;
    }
    setIsLoading(true);
    const res = await changeUserData(type, newValue, currentPassword);
    setIsLoading(false);

    if (res.isSuccess === false) {
      Toast.show({
        type: "error",
        text1: `Change ${type}`,
        text2: res.message,
      });
    } else {
      Toast.show({
        type: "success",
        text1: `Change ${type}`,
        text2: `${title} changed!`,
      });
      setIsEditing(false);
      setCurrentPassword("");
      setConfirmPassword("");
      await refetch();
    }
  };

  return (
    <View className="space-y-2 mt-5">
      <Text className="text-white font-psemibold text-xl">{title}</Text>
      <View
        className={`flex-row border border-gray-100 rounded-lg items-center space-x-3 ${
          isAvatarForm ? "aspect-square p-1.5" : "px-3 py-2"
        }`}
      >
        {isAvatarForm ? (
          <Image
            source={{ uri: value }}
            resizeMode="cover"
            className="w-full h-full rounded-lg"
          />
        ) : isEditing ? (
          <View className="w-full space-y-3">
            <View className="flex-row items-center p-2 bg-black-100 border border-black-200 rounded-lg focus:border-secondary">
              <TextInput
                className="flex-1 text-white text-lg"
                value={newValue?.toString()}
                onChangeText={(e) => setNewValue(e)}
                placeholder={`Enter your new ${type}!`}
                placeholderTextColor="#7b7b8b"
                secureTextEntry={isPasswordForm && !showPassword}
                {...(isValueNotString && { keyboardType: "numeric" })}
                {...(isEmailForm && { keyboardType: "email-address" })}
                editable={!isLoading}
              />
              {newValue !== "" && !isPasswordForm && (
                <TouchableOpacity
                  onPress={() => {
                    setNewValue("");
                  }}
                >
                  <X
                    size={13}
                    className="bg-gray-500 text-black rounded-full"
                  />
                </TouchableOpacity>
              )}
              {newValue !== "" && isPasswordForm && (
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {!showPassword ? (
                    <Eye size={18} className="text-white rounded-full" />
                  ) : (
                    <EyeOff size={18} className="text-white rounded-full" />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {isPasswordForm && (
              <View className="flex-row items-center p-2 bg-black-100 border border-black-200 rounded-lg focus:border-secondary">
                <TextInput
                  className="flex-1 text-white text-lg"
                  value={confirmPassword}
                  onChangeText={(e) => setConfirmPassword(e)}
                  placeholder="Confirm your new password!"
                  placeholderTextColor="#7b7b8b"
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                {confirmPassword !== "" && (
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {!showConfirmPassword ? (
                      <Eye size={18} className="text-white rounded-full" />
                    ) : (
                      <EyeOff size={18} className="text-white rounded-full" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
            {currentPasswordInputVisible && (
              <View className="flex-row items-center p-2 bg-black-100 border border-black-200 rounded-lg focus:border-secondary">
                <TextInput
                  className="flex-1 text-white text-lg"
                  value={currentPassword}
                  onChangeText={(e) => setCurrentPassword(e)}
                  placeholder="Enter your current password!"
                  placeholderTextColor="#7b7b8b"
                  secureTextEntry={!showCurrentPassword}
                  editable={!isLoading}
                />
                {currentPassword !== "" && (
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {!showCurrentPassword ? (
                      <Eye size={18} className="text-white rounded-full" />
                    ) : (
                      <EyeOff size={18} className="text-white rounded-full" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
            <View className="flex-row">
              <Button
                onPress={() => {
                  setNewValue(defaultValue);
                  setConfirmPassword("");
                  setCurrentPassword("");
                  setIsEditing(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onPress={handlePress}
                className="bg-emerald-600"
                textColor="white"
                disabled={isSaveButtonDisabled}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <>
            <Text className="text-white flex-1 text-lg">{value}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsEditing(true);
              }}
            >
              <Pencil className="text-white ml-auto" size={18} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};
