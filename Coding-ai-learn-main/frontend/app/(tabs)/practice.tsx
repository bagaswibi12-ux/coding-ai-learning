import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { api, type Challenge, type SyntaxItem } from "@/src/api";
import { Pill, Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

const simulatorLanguages = [
  { id: "python", label: "Python", code: 'nama = "SMA"\nprint("Halo,", nama)' },
  { id: "javascript", label: "JS", code: 'const nama = "SMA";\nconsole.log("Halo,", nama);' },
  { id: "cpp", label: "C++", code: '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Halo C++";\n  return 0;\n}' },
  { id: "java", label: "Java", code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Halo Java");\n  }\n}' },
] as const;

type Tab = "simulator" | "playground" | "challenge";

export default function Practice() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [tab, setTab] = useState<Tab>("simulator");
  const [language, setLanguage] = useState(simulatorLanguages[0]);
  const [code, setCode] = useState(language.code);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [query, setQuery] = useState("");
  const [syntax, setSyntax] = useState<SyntaxItem[]>([]);
  const [html, setHtml] = useState("<h1>Halo SyntaxAI</h1>\n<p>Belajar HTML & CSS.</p>");
  const [css, setCss] = useState("h1 { color: #0284C7; font-family: sans-serif; }\np { color: #334155; }");
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    api.syntax(query).then((result) => setSyntax(result.items.slice(0, 5))).catch(() => setSyntax([]));
  }, [query]);

  useEffect(() => {
    api.challenges().then((result) => setChallenges(result.items)).catch(() => setChallenges([]));
  }, []);

  const choose = (item: typeof language) => { setLanguage(item); setCode(item.code); setOutput(""); setError(""); };

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      const result = await api.runCode({ language: language.id, code });
      if (result.error) {
        setError(`${result.error}\n${result.hint}`);
        setOutput("");
      } else {
        setOutput(result.output || result.hint);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulator sedang bermasalah.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Praktik" subtitle="Tulis, jalankan, dan uji pemahamanmu" />
      <View style={styles.tabs}>
        <Pressable testID="practice-tab-simulator" onPress={() => setTab("simulator")} style={[styles.tab, tab === "simulator" ? { backgroundColor: colors.brandPrimary } : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.tabText, { color: tab === "simulator" ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>Simulator</Text>
        </Pressable>
        <Pressable testID="practice-tab-playground" onPress={() => setTab("playground")} style={[styles.tab, tab === "playground" ? { backgroundColor: colors.brandPrimary } : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.tabText, { color: tab === "playground" ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>HTML/CSS</Text>
        </Pressable>
        <Pressable testID="practice-tab-challenge" onPress={() => setTab("challenge")} style={[styles.tab, tab === "challenge" ? { backgroundColor: colors.brandPrimary } : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.tabText, { color: tab === "challenge" ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>Challenge</Text>
        </Pressable>
      </View>

      {tab === "simulator" ? (
        <View testID="practice-simulator">
          <SectionTitle title="Code simulator" action="Reset" onPress={() => setCode(language.code)} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
            {simulatorLanguages.map((item) => (
              <Pill key={item.id} label={item.label} active={item.id === language.id} onPress={() => choose(item)} />
            ))}
          </ScrollView>
          <View style={[styles.editor, { backgroundColor: colors.surfaceInverse }]}>
            <View style={styles.editorHeader}>
              <Text style={[styles.editorLabel, { color: colors.muted }]}>{language.label} • sandbox aman</Text>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.success} />
            </View>
            <TextInput
              testID="practice-code-input"
              multiline
              value={code}
              onChangeText={setCode}
              textAlignVertical="top"
              style={[styles.code, { color: colors.onSurfaceInverse }]}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
          <Pressable testID="practice-run-button" disabled={running} onPress={run} style={[styles.runButton, { backgroundColor: colors.brandPrimary }, running && { opacity: 0.65 }]}>
            {running ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <>
                <MaterialCommunityIcons name="play" size={20} color={colors.onBrandPrimary} />
                <Text style={[styles.runText, { color: colors.onBrandPrimary }]}>Jalankan kode</Text>
              </>
            )}
          </Pressable>
          <View style={[styles.output, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={styles.outputHeader}>
              <Text style={[styles.outputTitle, { color: colors.onSurface }]}>Output console</Text>
              <MaterialCommunityIcons name={error ? "alert-circle-outline" : "console-line"} size={19} color={error ? colors.error : colors.success} />
            </View>
            <Text selectable testID="practice-output" style={[styles.outputText, { color: error ? colors.error : colors.onSurfaceSecondary }]}>{error || output || "Output akan muncul di sini."}</Text>
          </View>

          <SectionTitle title="Cari syntax" action="Bandingkan" onPress={() => router.push("/syntax/compare")} />
          <View style={[styles.search, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="magnify" size={19} color={colors.muted} />
            <TextInput
              testID="practice-syntax-search"
              value={query}
              onChangeText={setQuery}
              placeholder="Contoh: function, loop, print"
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.onSurface }]}
              autoCapitalize="none"
            />
          </View>
          {syntax.map((item) => (
            <Pressable key={item.id} testID={`practice-syntax-${item.id}`} onPress={() => router.push(`/syntax/${item.id}`)} style={[styles.syntax, { backgroundColor: colors.surfaceTertiary }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.syntaxName, { color: colors.onSurface }]}>{item.name}</Text>
                <Text style={[styles.syntaxCategory, { color: colors.muted }]}>{item.language_id.toUpperCase()} • {item.category}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={19} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {tab === "playground" ? (
        <View testID="practice-playground">
          <SectionTitle title="HTML & CSS Playground" />
          <Text style={[styles.helper, { color: colors.muted }]}>Edit HTML dan CSS. Preview langsung di bawah.</Text>
          <View style={[styles.editor, { backgroundColor: colors.surfaceInverse }]}>
            <View style={styles.editorHeader}>
              <Text style={[styles.editorLabel, { color: colors.muted }]}>HTML</Text>
            </View>
            <TextInput
              testID="playground-html-input"
              multiline
              value={html}
              onChangeText={setHtml}
              textAlignVertical="top"
              style={[styles.code, { color: colors.onSurfaceInverse, minHeight: 110 }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={[styles.editor, { backgroundColor: colors.surfaceInverse, marginTop: 8 }]}>
            <View style={styles.editorHeader}>
              <Text style={[styles.editorLabel, { color: colors.muted }]}>CSS</Text>
            </View>
            <TextInput
              testID="playground-css-input"
              multiline
              value={css}
              onChangeText={setCss}
              textAlignVertical="top"
              style={[styles.code, { color: colors.onSurfaceInverse, minHeight: 110 }]}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Pressable
            testID="playground-open-preview"
            onPress={() => router.push({ pathname: "/playground", params: { html, css } })}
            style={[styles.runButton, { backgroundColor: colors.brandPrimary }]}
          >
            <MaterialCommunityIcons name="monitor-eye" size={20} color={colors.onBrandPrimary} />
            <Text style={[styles.runText, { color: colors.onBrandPrimary }]}>Buka preview</Text>
          </Pressable>
          <View style={[styles.output, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.outputTitle, { color: colors.onSurface }]}>Tips</Text>
            <Text style={[styles.outputText, { color: colors.onSurfaceSecondary, fontFamily: undefined }]}>Pakai kelas .btn, atur warna via color, dan uji di preview. Pencet Buka Preview untuk melihat hasilnya.</Text>
          </View>
        </View>
      ) : null}

      {tab === "challenge" ? (
        <View testID="practice-challenges">
          <SectionTitle title="Coding challenge" action={`${challenges.length} soal`} />
          <Text style={[styles.helper, { color: colors.muted }]}>Setiap tantangan punya output target. Dapatkan XP saat berhasil.</Text>
          {challenges.map((item) => (
            <Pressable key={item.id} testID={`challenge-${item.id}`} onPress={() => router.push(`/challenge/${item.id}`)} style={[styles.challengeRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <View style={[styles.challengeIcon, { backgroundColor: colors.brandTertiary }]}>
                <MaterialCommunityIcons name="puzzle-outline" size={22} color={colors.onBrandTertiary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.challengeTitle, { color: colors.onSurface }]}>{item.title}</Text>
                <Text style={[styles.challengeMeta, { color: colors.muted }]}>{item.language_id.toUpperCase()} • {item.difficulty} • +{item.xp} XP</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  tabs: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  tabText: { fontSize: 13, fontWeight: "800" },
  languageRow: { gap: 8, paddingRight: 8 },
  editor: { borderRadius: 18, overflow: "hidden", marginTop: 14 },
  editorHeader: { minHeight: 40, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  editorLabel: { fontSize: 11, fontWeight: "700" },
  code: { minHeight: 165, padding: 15, fontSize: 14, lineHeight: 22, fontFamily: "monospace" },
  runButton: { minHeight: 50, borderRadius: 16, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  runText: { fontSize: 14, fontWeight: "800" },
  output: { minHeight: 100, borderRadius: 18, borderWidth: 1, marginTop: 12, padding: 15 },
  outputHeader: { flexDirection: "row", justifyContent: "space-between" },
  outputTitle: { fontSize: 13, fontWeight: "800" },
  outputText: { fontFamily: "monospace", fontSize: 13, lineHeight: 20, marginTop: 13 },
  helper: { fontSize: 13, marginTop: 4, marginBottom: 4 },
  search: { minHeight: 48, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 7, marginTop: 4 },
  searchInput: { flex: 1, fontSize: 13 },
  syntax: { minHeight: 60, borderRadius: 15, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  syntaxName: { fontFamily: "monospace", fontWeight: "800", fontSize: 14 },
  syntaxCategory: { fontSize: 11, marginTop: 3 },
  challengeRow: { minHeight: 72, borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 },
  challengeIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  challengeTitle: { fontSize: 14, fontWeight: "800" },
  challengeMeta: { fontSize: 11, marginTop: 4 },
}));
