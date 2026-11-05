import React from "react";
import { Alert, Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/store/AppContext";
import Navigation from "./src/navigation";

// Trên web Alert.alert không làm gì -> thay bằng alert/confirm của trình duyệt
if (Platform.OS === "web") {
  (Alert as any).alert = (
    title: string,
    message?: string,
    buttons: any[] = [{ text: "OK" }],
  ) => {
    const text = [title, message].filter(Boolean).join("\n\n");
    if (buttons.length <= 1) {
      window.alert(text);
      buttons[0]?.onPress?.();
      return;
    }
    const ok = [...buttons].reverse().find((b) => b.style !== "cancel");
    const cancel = buttons.find((b) => b.style === "cancel");
    if (window.confirm(text)) ok?.onPress?.();
    else cancel?.onPress?.();
  };
}

export default function App() {
  const body = (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Navigation />
      </AppProvider>
    </SafeAreaProvider>
  );
  if (Platform.OS !== "web") return body;
  return (
    <View style={{ flex: 1, backgroundColor: "#E5E7EB", alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 430,
          backgroundColor: "#fff",
        }}
      >
        {body}
      </View>
    </View>
  );
}
