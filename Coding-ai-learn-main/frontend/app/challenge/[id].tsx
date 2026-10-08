import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { api, type Challenge } from "@/src/api";
import { Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type Result = { passed: boolean; output: string; expected: string; feedback: string; xp_earned: number };

export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.challenge(id)
      .then((item) => { setChallenge(item); setCode(item.starter); api.history({ content_type: "challenge", content_id: item.id, title: item.title }); })
      .catch((err) => setError(err instanceof Error ? err.message : "Challenge belum tersedia."));
  }, [id]);

  const submit = async () => {
    if (!challenge) return;
    setRunning(true);
    setError("");
    try {
      const resp = await api.submitChallenge({ challenge_id: challenge.id, code });
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit gagal, coba lagi.");
    } finally {
      setRunning(false);
    }
  };

  if (!challenge) {
    return (
      <Screen>
        <TopBar title="Challenge" back />
        {error ? <Text style={{ color: colors.error }}>{error}</Text> : <ActivityIndicator color={colors.brandPrimary} />}
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title={challenge.title} subtitle={`${challenge.language_id.toUpperCase()} • ${challenge.difficulty} • +${challenge.xp} XP`} back />
      <View style={[styles.hero, { backgroundColor: colors.brandTertiary }]} testID="challenge-description">
        <MaterialCommunityIcons name="target" size={28} color={colors.onBrandTertiary} />
        <Text style={[styles.description, { color: colors.onBrandTertiary }]}>{challenge.description}</Text>
      </View>
      <View style={[styles.expected, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.expectedLabel, { color: colors.muted }]}>OUTPUT YANG DIHARAPKAN</Text>
        <Text selectable style={[styles.expectedText, { color: colors.onSurface }]}>{challenge.expected}</Text>
      </View>
      <SectionTitle title="Tulis solusimu" action="Reset" onPress={() => setCode(challenge.starter)} />
      <View style={[styles.editor, { backgroundColor: colors.surfaceInverse }]}>
        <TextInput
          testID="challenge-code-input"
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
      <Pressable testID="challenge-submit-button" disabled={running} onPress={submit} style={[styles.button, { backgroundColor: colors.brandPrimary }, running && { opacity: 0.65 }]}>
        {running ? (
          <ActivityIndicator color={colors.onBrandPrimary} />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={19} color={colors.onBrandPrimary} />
            <Text style={[styles.buttonText, { color: colors.onBrandPrimary }]}>Jalankan & Submit</Text>
          </>
        )}
      </Pressable>
      {result ? (
        <View testID="challenge-result" style={[styles.result, { backgroundColor: result.passed ? colors.brandTertiary : colors.surfaceTertiary, borderColor: result.passed ? colors.success : colors.error }]}>
          <View style={styles.resultHeader}>
            <MaterialCommunityIcons name={result.passed ? "check-circle" : "alert-circle-outline"} size={22} color={result.passed ? colors.success : colors.error} />
            <Text style={[styles.resultTitle, { color: colors.onSurface }]}>{result.passed ? "Berhasil!" : "Belum berhasil"}</Text>
          </View>
          <Text style={[styles.resultFeedback, { color: colors.onSurfaceSecondary }]}>{result.feedback}</Text>
          <Text style={[styles.resultLabel, { color: colors.muted }]}>Output kamu</Text>
          <Text selectable style={[styles.resultOutput, { color: colors.onSurface }]}>{result.output || "(kosong)"}</Text>
          {result.passed ? (
            <Pressable onPress={() => router.back()} style={[styles.secondary, { borderColor: colors.brandPrimary }]}>
              <Text style={[styles.secondaryText, { color: colors.brandPrimary }]}>Kembali ke daftar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  hero: { borderRadius: 20, padding: 16, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  description: { flex: 1, fontSize: 15, lineHeight: 22, fontWeight: "600" },
  expected: { marginTop: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  expectedLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  expectedText: { fontFamily: "monospace", fontSize: 14, marginTop: 8 },
  editor: { borderRadius: 18, overflow: "hidden" },
  code: { minHeight: 180, padding: 15, fontSize: 14, lineHeight: 22, fontFamily: "monospace" },
  button: { minHeight: 52, borderRadius: 16, marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { fontSize: 15, fontWeight: "800" },
  result: { marginTop: 18, borderRadius: 18, borderWidth: 1, padding: 16 },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  resultTitle: { fontSize: 16, fontWeight: "800" },
  resultFeedback: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  resultLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 12 },
  resultOutput: { fontFamily: "monospace", fontSize: 13, marginTop: 6 },
  secondary: { marginTop: 14, minHeight: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 13, fontWeight: "800" },
  error: { fontSize: 13, marginTop: 12 },
}));
