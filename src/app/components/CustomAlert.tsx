import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
  onClose: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onClose,
  icon,
  iconColor = "#9333ea",
}: CustomAlertProps) {
  const getButtonStyle = (style?: "default" | "cancel" | "destructive") => {
    switch (style) {
      case "destructive":
        return {
          bg: "bg-red-500",
          text: "text-white",
          border: "border-red-500",
        };
      case "cancel":
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
        };
      default:
        return {
          bg: "bg-purple-600",
          text: "text-white",
          border: "border-purple-600",
        };
    }
  };

  const getIconByTitle = (title: string): keyof typeof Ionicons.glyphMap => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("delete") || lowerTitle.includes("remove")) {
      return "trash-outline";
    }
    if (lowerTitle.includes("sign out") || lowerTitle.includes("logout")) {
      return "log-out-outline";
    }
    if (lowerTitle.includes("success")) {
      return "checkmark-circle-outline";
    }
    if (lowerTitle.includes("error") || lowerTitle.includes("fail")) {
      return "alert-circle-outline";
    }
    if (lowerTitle.includes("warning") || lowerTitle.includes("caution")) {
      return "warning-outline";
    }
    if (lowerTitle.includes("save")) {
      return "save-outline";
    }
    if (lowerTitle.includes("cancel")) {
      return "close-circle-outline";
    }
    return "information-circle-outline";
  };

  const getIconColor = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("delete") || lowerTitle.includes("remove")) {
      return "#ef4444";
    }
    if (lowerTitle.includes("sign out") || lowerTitle.includes("logout")) {
      return "#f97316";
    }
    if (lowerTitle.includes("success")) {
      return "#22c55e";
    }
    if (lowerTitle.includes("error") || lowerTitle.includes("fail")) {
      return "#ef4444";
    }
    if (lowerTitle.includes("warning") || lowerTitle.includes("caution")) {
      return "#f59e0b";
    }
    return "#9333ea";
  };

  const displayIcon = icon || getIconByTitle(title);
  const displayIconColor = icon ? iconColor : getIconColor(title);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onPress={onClose}
      >
        <Pressable
          className="bg-white rounded-3xl mx-6 w-[85%] max-w-sm overflow-hidden shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Icon Header */}
          <View className="items-center pt-6 pb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: `${displayIconColor}15` }}
            >
              <Ionicons
                name={displayIcon}
                size={32}
                color={displayIconColor}
              />
            </View>
          </View>

          {/* Content */}
          <View className="px-6 pb-6">
            <Text className="text-xl font-bold text-gray-900 text-center mb-2">
              {title}
            </Text>
            {message && (
              <Text className="text-gray-600 text-center text-base leading-6">
                {message}
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View
            className={`px-4 pb-4 ${
              buttons.length > 1 ? "flex-row gap-3" : ""
            }`}
          >
            {buttons.map((button, index) => {
              const styles = getButtonStyle(button.style);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    button.onPress?.();
                    onClose();
                  }}
                  className={`${styles.bg} ${
                    buttons.length > 1 ? "flex-1" : "w-full"
                  } py-3.5 rounded-xl border ${styles.border}`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`${styles.text} font-semibold text-center text-base`}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
