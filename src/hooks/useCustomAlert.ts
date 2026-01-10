import { useState, useCallback } from "react";
import { CustomAlertButton } from "@/app/components/CustomAlert";

interface AlertConfig {
  title: string;
  message?: string;
  buttons?: CustomAlertButton[];
  icon?: string;
  iconColor?: string;
}

export function useCustomAlert() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    buttons: [{ text: "OK", style: "default" }],
  });

  const showAlert = useCallback(
    (
      title: string,
      message?: string,
      buttons?: CustomAlertButton[],
      options?: { icon?: string; iconColor?: string }
    ) => {
      setConfig({
        title,
        message,
        buttons: buttons || [{ text: "OK", style: "default" }],
        icon: options?.icon,
        iconColor: options?.iconColor,
      });
      setVisible(true);
    },
    []
  );

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    visible,
    config,
    showAlert,
    hideAlert,
  };
}
