import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, type Dashboard } from "@/src/api";
import { ProgressBar, SectionTitle } from "@/src/components/primitives";
import { useSession } from "@/src/session";
import { makeStyles, useTheme } from "@/src/theme";

export default function Home() {
  const { user } = useSession();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await api.dashboard();
      setData(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Koneksi sedang bermasalah.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (!data && !error) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.surface }]} testID="home-loading">
        <ActivityIndicator color={colors.brandPrimary} />
        <Text style={{ color: colors.muted }}>Menyiapkan ruang belajar...</Text>
      </View>
    );
  }

  const dashboard = data || ({
    user: user!,
    active_lesson: { id: "python-lesson-1", language_id: "python", title: "Pengenalan Python", summary: "Mulai dari fondasi Python.", xp: 10, duration: "8 menit", order: 1 } as any,
    language_progress: {}, completed_lessons: 0, syntax_learned: 0, quiz_completed: 0, challenge_completed: 0, badges: [], bookmarks: [], notes: [], history: [], recommendation: "Mulai dari Python.", daily_syntax: null, daily_challenge: null,
  } as Dashboard);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandPrimary} />}
      testID="home-screen"
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.brandPrimary }]}>SELAMAT DATANG KEMBALI</Text>
          <Text style={[styles.greeting, { color: colors.onSurface }]} testID="home-greeting">{dashboard.user.name.split(" ")[0]}</Text>
        </View>
        <Pressable testID="home-profile-avatar" onPress={() => router.push("/profile")} style={[styles.avatar, { backgroundColor: colors.brandTertiary }]}>
          <Text style={[styles.avatarText, { color: colors.onBrandTertiary }]}>{dashboard.user.name.charAt(0).toUpperCase()}</Text>
        </Pressable>
      </View>

      <View style={[styles.streak, { backgroundColor: colors.surfaceInverse }]} testID="home-streak-card">
        <View style={[styles.streakIcon, { backgroundColor: colors.brandTertiary }]}>
          <MaterialCommunityIcons name="fire" size={28} color={colors.warning} />
        </View>
        <View style={styles.streakCopy}>
          <Text style={[styles.streakNumber, { color: colors.onSurfaceInverse }]}>{dashboard.user.streak || 1} hari</Text>
          <Text style={[styles.streakLabel, { color: colors.muted }]}>Learning streak</Text>
        </View>
        <View style={styles.xp}>
          <Text style={[styles.xpNumber, { color: colors.onSurfaceInverse }]}>{dashboard.user.xp} XP</Text>
          <Text style={[styles.streakLabel, { color: colors.muted }]}>Level {dashboard.user.level}</Text>
        </View>
      </View>

      <SectionTitle title="Lanjutkan belajar" action="Lihat semua" onPress={() => router.push("/learn")} />
      <Pressable testID="home-continue-lesson" onPress={() => router.push(`/lesson/${dashboard.active_lesson.id}`)} style={[styles.continue, { backgroundColor: colors.brandPrimary }]}>
        <View style={[styles.continueIcon, { backgroundColor: colors.brandSecondary }]}>
          <MaterialCommunityIcons name="language-python" size={29} color={colors.onBrandSecondary} />
        </View>
        <View style={styles.continueCopy}>
          <Text style={[styles.continueLabel, { color: colors.onBrandPrimary }]}>{dashboard.active_lesson.language_id.toUpperCase()} • {dashboard.active_lesson.duration}</Text>
          <Text style={[styles.continueTitle, { color: colors.onBrandPrimary }]} numberOfLines={2}>{dashboard.active_lesson.title}</Text>
          <ProgressBar value={dashboard.active_lesson.progress || 0} color={colors.brandSecondary} />
          <Text style={[styles.continueProgress, { color: colors.onBrandPrimary }]}>{dashboard.active_lesson.progress || 0}% selesai</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={22} color={colors.onBrandPrimary} />
      </Pressable>

      <SectionTitle title="Rekomendasi untukmu" />
      <View style={styles.quickRow}>
        <Pressable testID="home-tutor-button" onPress={() => router.push("/tutor")} style={[styles.quickCard, { backgroundColor: colors.surfaceInverse }]}>
          <View style={[styles.quickIcon, { backgroundColor: colors.brandPrimary }]}>
            <MaterialCommunityIcons name="robot-happy-outline" size={22} color={colors.onBrandPrimary} />
          </View>
          <Text style={[styles.quickTitle, { color: colors.onSurfaceInverse }]}>AI Tutor</Text>
          <Text style={[styles.quickDesc, { color: colors.muted }]}>Minta hint, bukan jawaban.</Text>
        </Pressable>
        <Pressable testID="home-leaderboard-button" onPress={() => router.push("/leaderboard")} style={[styles.quickCard, { backgroundColor: colors.brandTertiary }]}>
          <View style={[styles.quickIcon, { backgroundColor: colors.brandPrimary }]}>
            <MaterialCommunityIcons name="trophy" size={22} color={colors.onBrandPrimary} />
          </View>
          <Text style={[styles.quickTitle, { color: colors.onBrandTertiary }]}>Leaderboard</Text>
          <Text style={[styles.quickDesc, { color: colors.onBrandTertiary }]}>Lihat peringkatmu.</Text>
        </Pressable>
      </View>
      <View style={[styles.recommendCard, { backgroundColor: colors.brandTertiary, marginTop: 10 }]} testID="home-recommendation">
        <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.onBrandTertiary} />
        <Text style={[styles.recommendText, { color: colors.onBrandTertiary }]}>{dashboard.recommendation}</Text>
      </View>

      {dashboard.daily_syntax ? (
        <>
          <SectionTitle title="Syntax hari ini" action="Lihat detail" onPress={() => dashboard.daily_syntax && router.push(`/syntax/${dashboard.daily_syntax.id}`)} />
          <Pressable testID="home-daily-syntax" onPress={() => dashboard.daily_syntax && router.push(`/syntax/${dashboard.daily_syntax.id}`)} style={[styles.daily, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <View style={[styles.dailyIcon, { backgroundColor: colors.brandTertiary }]}>
              <MaterialCommunityIcons name="code-tags" size={22} color={colors.onBrandTertiary} />
            </View>
            <View style={styles.dailyCopy}>
              <Text style={[styles.dailyName, { color: colors.onSurface }]}>{dashboard.daily_syntax.name}</Text>
              <Text numberOfLines={2} style={[styles.dailyDesc, { color: colors.muted }]}>{dashboard.daily_syntax.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </>
      ) : null}

      {dashboard.daily_challenge ? (
        <>
          <SectionTitle title="Challenge hari ini" />
          <Pressable testID="home-daily-challenge" onPress={() => dashboard.daily_challenge && router.push(`/challenge/${dashboard.daily_challenge.id}`)} style={[styles.challenge, { backgroundColor: colors.brandTertiary }]}>
            <View style={[styles.challengeIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <MaterialCommunityIcons name="puzzle-outline" size={24} color={colors.onBrandTertiary} />
            </View>
            <View style={styles.challengeCopy}>
              <Text style={[styles.challengeTitle, { color: colors.onBrandTertiary }]}>{dashboard.daily_challenge.title}</Text>
              <Text numberOfLines={2} style={[styles.challengeText, { color: colors.onBrandTertiary }]}>{dashboard.daily_challenge.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onBrandTertiary} />
          </Pressable>
        </>
      ) : null}

      {error ? <Text style={[styles.error, { color: colors.error }]} testID="home-error">{error}</Text> : null}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  greeting: { fontSize: 29, fontWeight: "800", marginTop: 5, letterSpacing: -0.6 },
  avatar: { width: 47, height: 47, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 18, fontWeight: "800" },
  streak: { minHeight: 92, borderRadius: 22, padding: 17, marginTop: 23, flexDirection: "row", alignItems: "center" },
  streakIcon: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  streakCopy: { flex: 1, marginLeft: 12 },
  streakNumber: { fontSize: 17, fontWeight: "800" },
  streakLabel: { fontSize: 12, marginTop: 3 },
  xp: { alignItems: "flex-end" },
  xpNumber: { fontSize: 17, fontWeight: "800" },
  continue: { minHeight: 142, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  continueIcon: { width: 52, height: 52, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  continueCopy: { flex: 1 },
  continueLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, opacity: 0.88 },
  continueTitle: { fontSize: 19, fontWeight: "800", marginVertical: 8 },
  continueProgress: { fontSize: 11, fontWeight: "700", marginTop: 6 },
  recommendCard: { minHeight: 68, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  recommendText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  quickRow: { flexDirection: "row", gap: 10 },
  quickCard: { flex: 1, minHeight: 100, borderRadius: 18, padding: 13 },
  quickIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickTitle: { fontSize: 15, fontWeight: "800", marginTop: 10 },
  quickDesc: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  daily: { minHeight: 72, borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  dailyIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  dailyCopy: { flex: 1 },
  dailyName: { fontSize: 15, fontWeight: "800", fontFamily: "monospace" },
  dailyDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  challenge: { minHeight: 88, borderRadius: 20, padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  challengeIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  challengeCopy: { flex: 1 },
  challengeTitle: { fontSize: 15, fontWeight: "800" },
  challengeText: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  error: { marginTop: 18, fontSize: 13 },
}));
