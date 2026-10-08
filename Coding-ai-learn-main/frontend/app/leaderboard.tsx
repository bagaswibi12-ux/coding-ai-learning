import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { api } from "@/src/api";
import { Pill, Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type Scope = "all" | "week";
type Entry = { rank: number; user_id: string; name: string; xp: number; level: number; level_name: string; streak: number; is_me: boolean };

export default function Leaderboard() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [scope, setScope] = useState<Scope>("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (next: Scope) => {
    setLoading(true);
    try {
      const result = await api.leaderboard(next);
      setEntries(result.entries);
      setMyRank(result.my_rank);
      setTotal(result.total);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(scope); }, [scope, load]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Screen>
      <TopBar title="Papan Peringkat" subtitle="Belajar bareng, saling dorong" back />
      <View style={styles.scopeRow}>
        <Pill label="All-time" active={scope === "all"} onPress={() => setScope("all")} />
        <Pill label="Minggu ini" active={scope === "week"} onPress={() => setScope("week")} />
      </View>
      <View style={[styles.myRank, { backgroundColor: colors.brandTertiary }]} testID="leaderboard-my-rank">
        <View style={[styles.myBadge, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.myBadgeText, { color: colors.onBrandTertiary }]}>#{myRank ?? "—"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.myLabel, { color: colors.onBrandTertiary }]}>Peringkat kamu</Text>
          <Text style={[styles.myDetail, { color: colors.onBrandTertiary }]}>{myRank ? `Dari ${total} siswa aktif` : "Mulai belajar untuk naik peringkat"}</Text>
        </View>
        <MaterialCommunityIcons name="trophy" size={28} color={colors.warning} />
      </View>
      <SectionTitle title={scope === "week" ? "Top siswa minggu ini" : "Top siswa all-time"} action={`${total} siswa`} />
      {loading ? (
        <ActivityIndicator color={colors.brandPrimary} testID="leaderboard-loading" />
      ) : entries.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surfaceTertiary }]} testID="leaderboard-empty">
          <MaterialCommunityIcons name="podium" size={30} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>Belum ada peringkat</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>{scope === "week" ? "Mulai mengerjakan materi atau kuis minggu ini." : "Jadilah yang pertama meraih XP."}</Text>
        </View>
      ) : (
        entries.map((item) => (
          <View key={item.user_id} testID={`leaderboard-row-${item.rank}`} style={[styles.row, { backgroundColor: item.is_me ? colors.brandTertiary : colors.surfaceSecondary, borderColor: item.is_me ? colors.brandPrimary : colors.border }]}>
            <View style={[styles.rank, { backgroundColor: item.rank <= 3 ? colors.brandPrimary : colors.surfaceTertiary }]}>
              <Text style={[styles.rankText, { color: item.rank <= 3 ? colors.onBrandPrimary : colors.muted }]}>{item.rank <= 3 ? medals[item.rank - 1] : item.rank}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.onSurface }]}>{item.name} {item.is_me ? "(kamu)" : ""}</Text>
              <Text style={[styles.sub, { color: colors.muted }]}>{item.level_name} • 🔥 {item.streak} hari</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.xp, { color: colors.brandPrimary }]}>{item.xp}</Text>
              <Text style={[styles.sub, { color: colors.muted }]}>XP</Text>
            </View>
          </View>
        ))
      )}
      <Pressable onPress={() => setScope(scope === "all" ? "week" : "all")} style={[styles.toggle, { borderColor: colors.border }]}>
        <MaterialCommunityIcons name="autorenew" size={18} color={colors.brandPrimary} />
        <Text style={[styles.toggleText, { color: colors.brandPrimary }]}>Lihat {scope === "all" ? "Minggu ini" : "All-time"}</Text>
      </Pressable>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  scopeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  myRank: { minHeight: 92, borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  myBadge: { minWidth: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  myBadgeText: { fontSize: 18, fontWeight: "900" },
  myLabel: { fontSize: 13, fontWeight: "800" },
  myDetail: { fontSize: 12, marginTop: 4 },
  empty: { minHeight: 150, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 8, padding: 18 },
  emptyTitle: { fontSize: 15, fontWeight: "800" },
  emptyText: { fontSize: 13, textAlign: "center" },
  row: { minHeight: 66, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  rank: { minWidth: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 15, fontWeight: "900" },
  name: { fontSize: 14, fontWeight: "800" },
  sub: { fontSize: 11, marginTop: 3 },
  xp: { fontSize: 16, fontWeight: "900" },
  toggle: { minHeight: 46, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  toggleText: { fontSize: 13, fontWeight: "800" },
}));
