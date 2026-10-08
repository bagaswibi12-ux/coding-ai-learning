import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { api, type Dashboard } from "@/src/api";
import { ProgressBar, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

const languageLabels: Record<string, string> = {
  python: "Python", javascript: "JavaScript", html: "HTML", css: "CSS", cpp: "C++", java: "Java", ai: "Artificial Intelligence",
};

export default function Progress() {
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Dashboard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => { try { setData(await api.dashboard()); } catch {} }, []);
  useEffect(() => { load(); }, [load]);
  const refresh = useCallback(async () => { setRefreshing(true); await load(); setRefreshing(false); }, [load]);

  if (!data) return <View style={[styles.loading, { backgroundColor: colors.surface }]}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandPrimary} />}
      testID="progress-screen"
    >
      <TopBar title="Progress" subtitle="Lihat langkah kecil yang sudah kamu buat" />
      <View style={[styles.xpCard, { backgroundColor: colors.brandPrimary }]} testID="progress-xp-card">
        <View style={[styles.levelCircle, { backgroundColor: colors.brandSecondary }]}>
          <Text style={[styles.levelNumber, { color: colors.onBrandSecondary }]}>{data.user.level}</Text>
          <Text style={[styles.levelLabel, { color: colors.onBrandSecondary }]}>LEVEL</Text>
        </View>
        <View style={styles.xpCopy}>
          <Text style={[styles.xpTitle, { color: colors.onBrandPrimary }]}>{data.user.level_name}</Text>
          <Text style={[styles.xpSub, { color: colors.onBrandPrimary }]}>{data.user.xp} XP terkumpul</Text>
          <ProgressBar value={(data.user.xp % 100)} color={colors.brandSecondary} />
        </View>
      </View>

      <View style={styles.statGrid}>
        <Stat icon="book-check-outline" value={String(data.completed_lessons)} label="Materi selesai" colors={colors} />
        <Stat icon="code-tags-check" value={String(data.syntax_learned)} label="Syntax dipelajari" colors={colors} />
        <Stat icon="clipboard-check-outline" value={String(data.quiz_completed)} label="Kuis selesai" colors={colors} />
        <Stat icon="target" value={String(data.challenge_completed)} label="Challenge" colors={colors} />
      </View>

      <SectionTitle title="Bahasa yang dipelajari" />
      {Object.entries(data.language_progress).map(([id, value]) => (
        <Pressable key={id} testID={`progress-lang-${id}`} onPress={() => router.push(`/lesson/${id}-lesson-1`)} style={styles.language}>
          <View style={styles.languageHead}>
            <Text style={[styles.languageName, { color: colors.onSurface }]}>{languageLabels[id] || id}</Text>
            <Text style={[styles.languageValue, { color: colors.brandPrimary }]}>{value}%</Text>
          </View>
          <ProgressBar value={value} />
        </Pressable>
      ))}

      <SectionTitle title="Achievement" action={`${data.badges.filter((badge) => badge.unlocked).length}/${data.badges.length}`} />
      {data.badges.map((badge) => (
        <View key={badge.id} testID={`badge-${badge.id}`} style={[styles.badge, { backgroundColor: badge.unlocked ? colors.brandTertiary : colors.surfaceTertiary }]}>
          <View style={[styles.badgeIcon, { backgroundColor: badge.unlocked ? colors.brandPrimary : colors.border }]}>
            <MaterialCommunityIcons name={badge.unlocked ? "trophy" : "lock-outline"} size={21} color={badge.unlocked ? colors.onBrandPrimary : colors.muted} />
          </View>
          <View style={styles.badgeCopy}>
            <Text style={[styles.badgeTitle, { color: colors.onSurface }]}>{badge.title}</Text>
            <Text style={[styles.badgeDesc, { color: colors.muted }]}>{badge.description}</Text>
          </View>
          <MaterialCommunityIcons name={badge.unlocked ? "check-circle" : "circle-outline"} size={20} color={badge.unlocked ? colors.success : colors.muted} />
        </View>
      ))}

      {data.bookmarks.length ? (
        <>
          <SectionTitle title="Materi disimpan" />
          {data.bookmarks.map((item) => (
            <Pressable key={item.content_id} testID={`bookmark-${item.content_id}`} onPress={() => router.push(item.content_type === "syntax" ? `/syntax/${item.content_id}` : `/lesson/${item.content_id}`)} style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="bookmark" size={18} color={colors.brandPrimary} />
              <Text numberOfLines={1} style={[styles.rowText, { color: colors.onSurface }]}>{item.title}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </>
      ) : null}

      {data.history.length ? (
        <>
          <SectionTitle title="Riwayat belajar" />
          {data.history.slice(0, 6).map((item) => (
            <Pressable key={item.content_id} testID={`history-${item.content_id}`} onPress={() => router.push(item.content_type === "syntax" ? `/syntax/${item.content_id}` : item.content_type === "challenge" ? `/challenge/${item.content_id}` : `/lesson/${item.content_id}`)} style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="history" size={18} color={colors.muted} />
              <Text numberOfLines={1} style={[styles.rowText, { color: colors.onSurface }]}>{item.title}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

function Stat({ icon, value, label, colors }: { icon: string; value: string; label: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  const styles = useStyles();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
      <MaterialCommunityIcons name={icon as any} size={22} color={colors.brandPrimary} />
      <Text style={[styles.statValue, { color: colors.onSurface }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  xpCard: { minHeight: 136, borderRadius: 22, padding: 18, flexDirection: "row", alignItems: "center", gap: 15 },
  levelCircle: { width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center" },
  levelNumber: { fontSize: 28, fontWeight: "900" },
  levelLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  xpCopy: { flex: 1 },
  xpTitle: { fontSize: 19, fontWeight: "800" },
  xpSub: { fontSize: 12, marginTop: 6, marginBottom: 14 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 16 },
  stat: { width: "48%", minHeight: 92, borderWidth: 1, borderRadius: 17, padding: 13 },
  statValue: { fontSize: 23, fontWeight: "900", marginTop: 9 },
  statLabel: { fontSize: 11, marginTop: 1 },
  language: { marginBottom: 14 },
  languageHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 },
  languageName: { fontSize: 13, fontWeight: "700" },
  languageValue: { fontSize: 12, fontWeight: "800" },
  badge: { minHeight: 70, borderRadius: 17, padding: 11, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 9 },
  badgeIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeCopy: { flex: 1 },
  badgeTitle: { fontSize: 14, fontWeight: "800" },
  badgeDesc: { fontSize: 11, marginTop: 3 },
  row: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 7 },
  rowText: { flex: 1, fontSize: 13, fontWeight: "700" },
}));
