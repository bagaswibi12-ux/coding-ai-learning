import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { Screen, TopBar } from "@/src/components/primitives";
import { useTheme } from "@/src/theme";

export default function Playground() {
  const params = useLocalSearchParams<{ html?: string; css?: string }>();
  const { colors } = useTheme();
  const html = (params.html as string) || "<p>Isi HTML belum ada.</p>";
  const css = (params.css as string) || "";
  const document = useMemo(() => `<!DOCTYPE html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><style>body{font-family: -apple-system, Roboto, sans-serif; margin:16px; color:#0F172A;} ${css}</style></head><body>${html}</body></html>`, [html, css]);
  return (
    <Screen scroll={false}>
      <TopBar title="Preview" subtitle="HTML + CSS kamu di-render di sini" back />
      <View style={[styles.frame, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]} testID="playground-preview">
        {Platform.OS === "web" ? (
          <iframe title="playground" style={{ border: "none", width: "100%", height: "100%" }} srcDoc={document} />
        ) : (
          <WebView originWhitelist={["*"]} source={{ html: document }} style={{ flex: 1 }} />
        )}
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>Perubahan tidak otomatis—kembali ke tab Praktik untuk mengedit lagi.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  hint: { marginTop: 10, fontSize: 12, textAlign: "center" },
});
