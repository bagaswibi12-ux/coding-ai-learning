import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { api, type SyntaxItem } from "@/src/api";
import { Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

export default function SyntaxDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const [item, setItem] = useState<SyntaxItem | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.syntaxDetail(id).then((result) => {
      setItem(result);
      api.history({ content_type: "syntax", content_id: result.id, title: result.name }).catch(() => undefined);
      api.progress({ item_id: result.id, item_type: "syntax", percentage: 100, xp: 5 }).catch(() => undefined);
    });
  }, [id]);

  if (!item) return <Screen><TopBar title="Syntax" back /><Text style={{ color: colors.muted }}>Memuat syntax...</Text></Screen>;

  const bookmark = async () => {
    try { const result = await api.bookmark({ content_type: "syntax", content_id: item.id, title: item.name }); setSaved(result.saved); setMessage(result.saved ? "Syntax disimpan ke bookmark." : "Bookmark dihapus."); } catch {}
  };
  const saveNote = async () => {
    if (!note.trim()) return;
    try { await api.note({ content_type: "syntax", content_id: item.id, note }); setNote(""); setMessage("Catatan pribadi tersimpan."); } catch {}
  };

  return (
    <Screen>
      <TopBar title={item.name} subtitle={`${item.language_id.toUpperCase()} • ${item.category}`} back action={
        <Pressable testID="syntax-bookmark" onPress={bookmark} style={[styles.action, { backgroundColor: colors.surfaceTertiary }]}>
          <MaterialCommunityIcons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.brandPrimary} />
        </Pressable>
      } />
      <Text style={[styles.heading, { color: colors.onSurface }]} testID="syntax-description">{item.description}</Text>
      <SectionTitle title="Cara penggunaan" />
      <CodeBlock label="SYNTAX" value={item.syntax} colors={colors} testID="syntax-code" />
      <CodeBlock label="CONTOH" value={item.example} colors={colors} testID="syntax-example" />
      <View style={[styles.output, { backgroundColor: colors.brandTertiary }]}>
        <Text style={[styles.outputLabel, { color: colors.onBrandTertiary }]}>OUTPUT</Text>
        <Text style={[styles.outputText, { color: colors.onBrandTertiary }]}>{item.output}</Text>
      </View>
      <SectionTitle title="Kesalahan umum" />
      {item.mistakes.map((mistake, index) => (
        <View key={index} style={styles.bullet}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text style={[styles.bulletText, { color: colors.onSurfaceSecondary }]}>{mistake}</Text>
        </View>
      ))}
      <Pressable testID="syntax-try-simulator" onPress={() => router.push("/practice")} style={[styles.practice, { backgroundColor: colors.brandPrimary }]}>
        <MaterialCommunityIcons name="play" size={19} color={colors.onBrandPrimary} />
        <Text style={[styles.practiceText, { color: colors.onBrandPrimary }]}>Coba di simulator</Text>
      </Pressable>
      <SectionTitle title="Catatan saya" />
      <TextInput
        testID="syntax-note-input"
        multiline
        value={note}
        onChangeText={setNote}
        placeholder="Tulis pengingat singkat..."
        placeholderTextColor={colors.muted}
        style={[styles.note, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.onSurface }]}
      />
      <Pressable testID="syntax-save-note" onPress={saveNote} style={[styles.noteButton, { borderColor: colors.brandPrimary }]}>
        <Text style={[styles.noteButtonText, { color: colors.brandPrimary }]}>Simpan catatan</Text>
      </Pressable>
      {message ? <Text testID="syntax-message" style={[styles.message, { color: colors.success }]}>{message}</Text> : null}
    </Screen>
  );
}

function CodeBlock({ label, value, colors, testID }: { label: string; value: string; colors: ReturnType<typeof useTheme>["colors"]; testID?: string }) {
  const styles = useStyles();
  return (
    <View testID={testID} style={[styles.code, { backgroundColor: colors.surfaceInverse }]}>
      <Text style={[styles.codeLabel, { color: colors.muted }]}>{label}</Text>
      <Text selectable style={[styles.codeText, { color: colors.onSurfaceInverse }]}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  action: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "800" },
  code: { borderRadius: 17, padding: 15, marginBottom: 10 },
  codeLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  codeText: { fontFamily: "monospace", fontSize: 14, lineHeight: 22, marginTop: 8 },
  output: { borderRadius: 17, padding: 15, marginTop: 5 },
  outputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  outputText: { fontFamily: "monospace", fontSize: 14, marginTop: 8 },
  bullet: { flexDirection: "row", gap: 9, alignItems: "center", minHeight: 38 },
  bulletText: { fontSize: 14, flex: 1 },
  practice: { minHeight: 50, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 21 },
  practiceText: { fontSize: 14, fontWeight: "800" },
  note: { minHeight: 100, borderRadius: 16, borderWidth: 1, padding: 13, textAlignVertical: "top", fontSize: 13 },
  noteButton: { minHeight: 46, borderRadius: 15, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 9 },
  noteButtonText: { fontSize: 13, fontWeight: "800" },
  message: { textAlign: "center", fontSize: 13, fontWeight: "700", marginTop: 13 },
}));
