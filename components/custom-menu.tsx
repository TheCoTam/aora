import { LucideIcon } from "lucide-react-native";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { Button, Menu } from "react-native-paper";

interface CustomMenuProps {
  icon: LucideIcon;
  items: {
    title: string;
    icon?: LucideIcon;
    onPress: () => void;
  }[];
}

const CustomMenu = ({ icon: Icon, items }: CustomMenuProps) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <Button onPress={openMenu} className="mt-2 p-1.5">
          <Icon size={25} className="text-white" />
        </Button>
      }
    >
      {items.map((item, index) => {
        const { title, icon: SubIcon, onPress } = item;
        return (
          <Menu.Item
            key={index}
            onPress={() => {
              closeMenu();
              onPress();
            }}
            title={
              <View className="flex-row items-center space-x-1.5">
                {SubIcon && <SubIcon className="text-white" />}
                <Text className="text-white">{title}</Text>
              </View>
            }
          />
        );
      })}
    </Menu>
  );
};

export default CustomMenu;
