import { View, Text } from "react-native";
import React from "react";

interface InfoBoxProps {
  title: string | number;
  subtitle?: string;
  containerStyle?: string;
  titleStyle?: string;
}

const InfoBox = ({
  title,
  subtitle,
  containerStyle,
  titleStyle,
}: InfoBoxProps) => {
  return (
    <View className={containerStyle}>
      <Text className={`text-white text-center font-psemibold ${titleStyle}`}>
        {title}
      </Text>
      <Text className="text-sm text-gray-100 text-center font-pregular">
        {subtitle}
      </Text>
    </View>
  );
};

export default InfoBox;
