import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import { useSession } from "@/src/session";
import { useTheme } from "@/src/theme";
import { storage } from "@/src/utils/storage";

export default function Index() {
  const { user, loading } = useSession();
  const { colors } = useTheme();
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => { storage.getItem("syntaxai_onboarding", false).then((value) => setSeen(Boolean(value))); }, []);
  if (loading || seen === null) return <View style={[styles.loading, { backgroundColor: colors.surface }]}><Text style={[styles.logo, { color: colors.brandPrimary }]}>SyntaxAI</Text><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href={seen ? "/auth" : "/onboarding"} />;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18 }, logo: { fontSize: 34, fontWeight: "800", letterSpacing: -1 } });