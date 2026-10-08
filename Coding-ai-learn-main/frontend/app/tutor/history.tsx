import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { api } from "@/src/api";
import { Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type Item = { id: string; title: string; created_at: string; updated_at: string };

export default function TutorHistory() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [items, setItems] = useState<Item[] | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.tutorConversations();
      setItems(result.items);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (id: string) => {
    await api.tutorDelete(id).catch(() => undefined);
    load();
  };

  return (
    <Screen>
      <TopBar title="Riwayat Tutor" subtitle="Lanjutkan atau bersihkan percakapan" back />
      <Pressable testID="tutor-new-chat" onPress={() => router.push("/tutor")} style={[styles.new, { backgroundColor: colors.brandPrimary }]}>
        <MaterialCommunityIcons name="plus" size={20} color={colors.onBrandPrimary} />
        <Text style={[styles.newText, { color: colors.onBrandPrimary }]}>Mulai chat baru</Text>
      </Pressable>
      <SectionTitle title="Percakapan sebelumnya" />
      {items === null ? (
        <ActivityIndicator color={colors.brandPrimary} />
      ) : items.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surfaceTertiary }]} testID="tutor-history-empty">
          <MaterialCommunityIcons name="robot-outline" size={32} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>Belum ada percakapan</Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Pertanyaan pertamamu akan muncul di sini.</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} testID={`tutor-conv-${item.id}`} style={[styles.item, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Pressable style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }} onPress={() => router.push({ pathname: "/tutor", params: { id: item.id } })}>
              <MaterialCommunityIcons name="chat-outline" size={22} color={colors.brandPrimary} />
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.onSurface }]}>{item.title}</Text>
                <Text style={[styles.itemMeta, { color: colors.muted }]}>{new Date(item.updated_at).toLocaleString("id-ID")}</Text>
              </View>
            </Pressable>
            <Pressable testID={`tutor-delete-${item.id}`} onPress={() => remove(item.id)} style={{ padding: 8 }}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        ))
      )}
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  new: { minHeight: 50, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  newText: { fontSize: 14, fontWeight: "800" },
  empty: { minHeight: 150, borderRadius: 18, alignItems: "center", justifyContent: "center", padding: 18, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: "800" },
  emptyText: { fontSize: 13, textAlign: "center" },
  item: { minHeight: 60, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  itemMeta: { fontSize: 11, marginTop: 3 },
}));
