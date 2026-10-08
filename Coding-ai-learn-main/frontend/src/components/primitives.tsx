import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type PropsWithChildren, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, useTheme } from "@/src/theme";

export function Screen({ children, scroll = true }: PropsWithChildren<{ scroll?: boolean }>) {
  const insets = useSafeAreaInsets();
  const styles = useScreenStyles();
  const content = <View style={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 22 }]}>{children}</View>;
  if (!scroll) return <View style={styles.root}>{content}</View>;
  return <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView>;
}

const useScreenStyles = makeStyles((colors) => ({ root: { flex: 1, backgroundColor: colors.surface }, scroll: { flexGrow: 1 }, content: { paddingHorizontal: 20 } }));

export function TopBar({ title, subtitle, back = false, action }: { title: string; subtitle?: string; back?: boolean; action?: ReactNode }) {
  const { colors } = useTheme();
  return <View style={styles.topBar}>{back ? <Pressable onPress={() => router.back()} style={[styles.back, { backgroundColor: colors.surfaceTertiary }]}><MaterialCommunityIcons name="arrow-left" size={22} color={colors.onSurface} /></Pressable> : null}<View style={styles.topCopy}><Text style={[styles.topTitle, { color: colors.onSurface }]}>{title}</Text>{subtitle ? <Text style={[styles.topSubtitle, { color: colors.muted }]}>{subtitle}</Text> : null}</View>{action || <View style={styles.actionSpace} />}</View>;
}

export function ProgressBar({ value, color }: { value: number; color?: string }) { const { colors } = useTheme(); return <View style={[styles.progressTrack, { backgroundColor: colors.surfaceTertiary }]}><View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color || colors.brandPrimary }]} /></View>; }
export function Pill({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) { const { colors } = useTheme(); return <Pressable onPress={onPress} style={[styles.pill, { backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary, borderColor: active ? colors.brandPrimary : colors.border }]}><Text style={[styles.pillText, { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>{label}</Text></Pressable>; }
export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) { const { colors } = useTheme(); return <View style={styles.sectionTitle}><Text style={[styles.sectionText, { color: colors.onSurface }]}>{title}</Text>{action ? <Pressable onPress={onPress} hitSlop={8}><Text style={[styles.sectionAction, { color: colors.brandPrimary }]}>{action}</Text></Pressable> : null}</View>; }

const styles = StyleSheet.create({ topBar: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 }, topCopy: { flex: 1 }, topTitle: { fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }, topSubtitle: { fontSize: 13, marginTop: 4 }, back: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }, actionSpace: { width: 44, height: 44 }, progressTrack: { height: 7, borderRadius: 8, overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 8 }, pill: { minHeight: 38, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" }, pillText: { fontSize: 12, fontWeight: "800" }, sectionTitle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 26 }, sectionText: { fontSize: 18, fontWeight: "800" }, sectionAction: { fontSize: 12, fontWeight: "800" } });