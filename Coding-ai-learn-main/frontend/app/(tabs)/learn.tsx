import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { api, type Language } from "@/src/api";
import { Pill, ProgressBar, Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

const filters = [
  { id: "all", label: "Semua" },
  { id: "code", label: "Coding" },
  { id: "web", label: "Web" },
  { id: "ai", label: "AI" },
];

export default function Learn() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.catalog()
      .then((data) => { setLanguages(data.languages); setError(""); })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat katalog."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => languages.filter((item) => {
    const matches = !query || (item.name + item.description).toLowerCase().includes(query.toLowerCase());
    const group = item.id === "ai" ? "ai" : ["html", "css"].includes(item.id) ? "web" : "code";
    return matches && (filter === "all" || group === filter);
  }), [filter, languages, query]);

  return (
    <Screen>
      <TopBar title="Belajar" subtitle="Pilih jalur yang ingin kamu kuasai" />
      <View style={[styles.search, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="magnify" size={21} color={colors.muted} />
        <TextInput
          testID="learn-search-input"
          value={query}
          onChangeText={setQuery}
          placeholder="Cari bahasa atau konsep..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.onSurface }]}
          autoCapitalize="none"
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((item) => (
          <Pill key={item.id} label={item.label} active={filter === item.id} onPress={() => setFilter(item.id)} />
        ))}
      </ScrollView>
      <SectionTitle title="Learning path" action={`${visible.length} jalur`} />
      {loading ? (
        <ActivityIndicator color={colors.brandPrimary} testID="learn-loading" />
      ) : (
        <View style={styles.grid} testID="learn-language-grid">
          {visible.map((item) => (
            <LanguageCard key={item.id} item={item} colors={colors} onPress={() => router.push(`/lesson/${item.id}-lesson-1`)} />
          ))}
        </View>
      )}
      {!loading && visible.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surfaceTertiary }]} testID="learn-empty">
          <MaterialCommunityIcons name="book-search-outline" size={34} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>Belum menemukan jalur</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Coba kata kunci lain.</Text>
        </View>
      ) : null}
      {error ? <Text style={[styles.errorText, { color: colors.error }]} testID="learn-error">{error}</Text> : null}
    </Screen>
  );
}

function LanguageCard({ item, colors, onPress }: { item: Language; colors: ReturnType<typeof useTheme>["colors"]; onPress: () => void }) {
  const styles = useStyles();
  return (
    <Pressable testID={`learn-lang-${item.id}`} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, pressed && { opacity: 0.82 }]}>
      <View style={styles.cardTop}>
        <View style={[styles.languageIcon, { backgroundColor: colors.brandTertiary }]}>
          <MaterialCommunityIcons name={item.icon as any} size={25} color={colors.onBrandTertiary} />
        </View>
        <Text style={[styles.level, { color: colors.muted }]}>{item.level}</Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.onSurface }]}>{item.name}</Text>
      <Text numberOfLines={2} style={[styles.cardDesc, { color: colors.muted }]}>{item.description}</Text>
      <View style={styles.cardMeta}>
        <Text style={[styles.progressText, { color: colors.brandPrimary }]}>{item.progress}%</Text>
        <Text style={[styles.lessonCount, { color: colors.muted }]}>{item.lessons_count} materi • {item.syntax_count} syntax</Text>
      </View>
      <ProgressBar value={item.progress} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  search: { minHeight: 49, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 9 },
  searchInput: { flex: 1, fontSize: 14 },
  filters: { flexDirection: "row", gap: 8, marginTop: 15, paddingRight: 8 },
  grid: { gap: 12 },
  card: { borderWidth: 1, borderRadius: 20, padding: 15, minHeight: 184 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  languageIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  level: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 18, fontWeight: "800", marginTop: 14 },
  cardDesc: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 13, marginBottom: 7 },
  progressText: { fontSize: 12, fontWeight: "800" },
  lessonCount: { fontSize: 11 },
  empty: { minHeight: 170, borderRadius: 20, alignItems: "center", justifyContent: "center", padding: 20, gap: 7 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginTop: 8 },
  emptyText: { fontSize: 13 },
  errorText: { marginTop: 12, fontSize: 13 },
}));
