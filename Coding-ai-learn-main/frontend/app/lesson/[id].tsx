import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { api, type SyntaxItem } from "@/src/api";
import { ProgressBar, Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type LessonResult = Awaited<ReturnType<typeof api.lesson>>;

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const [data, setData] = useState<LessonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    api.lesson(id)
      .then((result) => {
        setData(result);
        api.history({ content_type: "lesson", content_id: result.lesson.id, title: result.lesson.title }).catch(() => undefined);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Materi belum tersedia."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={[styles.loading, { backgroundColor: colors.surface }]}><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (!data) return <Screen><TopBar title="Materi" back /><Text style={{ color: colors.muted }}>{error || "Materi belum tersedia."}</Text></Screen>;

  const complete = async () => {
    try {
      await api.progress({ item_id: data.lesson.id, item_type: "lesson", percentage: 100, xp: data.lesson.xp });
      setMessage(`Materi selesai · +${data.lesson.xp} XP`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menyimpan progress.");
    }
  };

  const bookmark = async () => {
    try {
      const result = await api.bookmark({ content_type: "lesson", content_id: data.lesson.id, title: data.lesson.title });
      setSaved(result.saved);
    } catch {}
  };

  return (
    <Screen>
      <TopBar
        title={data.lesson.title}
        subtitle={`${data.lesson.language_id.toUpperCase()} • ${data.lesson.duration}`}
        back
        action={
          <Pressable testID="lesson-bookmark" onPress={bookmark} style={[styles.action, { backgroundColor: colors.surfaceTertiary }]}>
            <MaterialCommunityIcons name={saved ? "bookmark" : "bookmark-outline"} size={20} color={colors.brandPrimary} />
          </Pressable>
        }
      />
      <View style={[styles.hero, { backgroundColor: colors.brandTertiary }]} testID="lesson-hero">
        <View style={[styles.heroIcon, { backgroundColor: colors.surfaceSecondary }]}>
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color={colors.onBrandTertiary} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.onBrandTertiary }]}>{data.lesson.summary}</Text>
        <Text style={[styles.heroMeta, { color: colors.onBrandTertiary }]}>Progress saat ini {data.progress}%</Text>
        <ProgressBar value={data.progress} color={colors.brandPrimary} />
      </View>
      <SectionTitle title="Pahami konsepnya" />
      {data.sections.map((section, index) => (
        <View key={`${section.title}-${index}`} testID={`lesson-section-${index}`} style={[styles.section, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{section.title}</Text>
          <Text style={[styles.sectionBody, { color: colors.onSurfaceSecondary }]}>{section.body}</Text>
        </View>
      ))}
      <SectionTitle title="Syntax terkait" action="Semua syntax" onPress={() => router.push("/practice")} />
      {data.syntax.map((item: SyntaxItem) => (
        <Pressable key={item.id} testID={`lesson-syntax-${item.id}`} onPress={() => router.push(`/syntax/${item.id}`)} style={[styles.syntax, { backgroundColor: colors.surfaceTertiary }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.syntaxName, { color: colors.onSurface }]}>{item.name}</Text>
            <Text style={[styles.syntaxDesc, { color: colors.muted }]}>{item.description}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={21} color={colors.muted} />
        </Pressable>
      ))}
      {data.challenge ? (
        <>
          <SectionTitle title="Challenge terkait" />
          <Pressable testID="lesson-challenge" onPress={() => data.challenge && router.push(`/challenge/${data.challenge.id}`)} style={[styles.challenge, { backgroundColor: colors.brandTertiary }]}>
            <MaterialCommunityIcons name="target" size={23} color={colors.onBrandTertiary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.challengeTitle, { color: colors.onBrandTertiary }]}>{data.challenge.title}</Text>
              <Text style={[styles.challengeDesc, { color: colors.onBrandTertiary }]}>+{data.challenge.xp} XP</Text>
            </View>
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onBrandTertiary} />
          </Pressable>
        </>
      ) : null}
      <View style={styles.actions}>
        <Pressable testID="lesson-quiz-button" onPress={() => router.push(`/quiz/${data.quiz_id}`)} style={[styles.secondaryButton, { borderColor: colors.brandPrimary }]}>
          <Text style={[styles.secondaryText, { color: colors.brandPrimary }]}>Mulai kuis</Text>
        </Pressable>
        <Pressable testID="lesson-complete-button" onPress={complete} style={[styles.primaryButton, { backgroundColor: colors.brandPrimary }]}>
          <MaterialCommunityIcons name="check" size={19} color={colors.onBrandPrimary} />
          <Text style={[styles.primaryText, { color: colors.onBrandPrimary }]}>Selesaikan</Text>
        </Pressable>
      </View>
      {message ? <Text testID="lesson-message" style={[styles.success, { color: colors.success }]}>{message}</Text> : null}
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  action: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 22, padding: 18 },
  heroIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 18, lineHeight: 25, fontWeight: "800", marginTop: 16 },
  heroMeta: { fontSize: 12, marginTop: 12, marginBottom: 8 },
  section: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  sectionBody: { fontSize: 14, lineHeight: 22, marginTop: 8 },
  syntax: { minHeight: 66, borderRadius: 16, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", marginBottom: 9 },
  syntaxName: { fontSize: 15, fontFamily: "monospace", fontWeight: "800" },
  syntaxDesc: { fontSize: 12, marginTop: 4 },
  challenge: { minHeight: 70, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 9 },
  challengeTitle: { fontSize: 15, fontWeight: "800" },
  challengeDesc: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 10, marginTop: 25 },
  primaryButton: { flex: 1, minHeight: 50, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7 },
  primaryText: { fontSize: 14, fontWeight: "800" },
  secondaryButton: { flex: 1, minHeight: 50, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 14, fontWeight: "800" },
  success: { textAlign: "center", fontSize: 13, fontWeight: "700", marginTop: 15 },
}));
