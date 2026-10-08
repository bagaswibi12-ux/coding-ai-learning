import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ComponentProps, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSession } from "@/src/session";
import { useTheme } from "@/src/theme";
import { storage } from "@/src/utils/storage";

export default function Auth() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Email dan password wajib diisi."); return; }
    if (mode === "register") {
      if (!name.trim()) { setError("Nama wajib diisi untuk pendaftaran."); return; }
      if (password.length < 8) { setError("Password minimal 8 karakter."); return; }
      if (password !== confirm) { setError("Konfirmasi password belum sama."); return; }
    }
    setBusy(true);
    try {
      const experience = (await storage.getItem("syntaxai_experience", "Belum pernah coding" as string)) || "Belum pernah coding";
      if (mode === "login") await signIn(email.trim(), password);
      else await signUp(name.trim(), email.trim(), password, experience);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Koneksi sedang bermasalah.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.root, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={[styles.logo, { backgroundColor: colors.brandTertiary }]} testID="auth-logo">
          <MaterialCommunityIcons name="code-braces" size={28} color={colors.brandPrimary} />
        </View>
        <Text style={[styles.heading, { color: colors.onSurface }]} testID="auth-heading">
          {mode === "login" ? "Selamat datang kembali" : "Buat akun belajarmu"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {mode === "login" ? "Lanjutkan perjalanan coding dan AI kamu." : "Progress, XP, dan achievement tersimpan aman."}
        </Text>
        <View style={[styles.switcher, { backgroundColor: colors.surfaceTertiary }]}>
          <Pressable testID="auth-mode-login" onPress={() => { setMode("login"); setError(""); }} style={[styles.switch, mode === "login" && { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.switchText, { color: mode === "login" ? colors.brandPrimary : colors.muted }]}>Masuk</Text>
          </Pressable>
          <Pressable testID="auth-mode-register" onPress={() => { setMode("register"); setError(""); }} style={[styles.switch, mode === "register" && { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.switchText, { color: mode === "register" ? colors.brandPrimary : colors.muted }]}>Daftar</Text>
          </Pressable>
        </View>
        {mode === "register" ? (
          <Field testID="auth-name-input" label="Nama" value={name} onChangeText={setName} placeholder="Nama panggilan kamu" colors={colors} />
        ) : null}
        <Field testID="auth-email-input" label="Email" value={email} onChangeText={setEmail} placeholder="kamu@email.com" keyboardType="email-address" colors={colors} />
        <Field testID="auth-password-input" label="Password" value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" secureTextEntry colors={colors} />
        {mode === "register" ? (
          <Field testID="auth-confirm-input" label="Konfirmasi password" value={confirm} onChangeText={setConfirm} placeholder="Ulangi password" secureTextEntry colors={colors} />
        ) : null}
        {error ? (
          <Text testID="auth-error" style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
        <Pressable testID="auth-submit-button" disabled={busy} onPress={submit} style={({ pressed }) => [styles.button, { backgroundColor: colors.brandPrimary }, pressed && styles.pressed, busy && { opacity: 0.65 }]}>
          {busy ? (
            <ActivityIndicator color={colors.onBrandPrimary} />
          ) : (
            <>
              <Text style={[styles.buttonText, { color: colors.onBrandPrimary }]}>{mode === "login" ? "Masuk ke SyntaxAI" : "Buat akun"}</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onBrandPrimary} />
            </>
          )}
        </Pressable>
        {mode === "login" ? (
          <Text style={[styles.forgotText, { color: colors.muted }]}>Lupa password? Hubungi dukungan dari menu Profil setelah masuk.</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, colors, testID, ...props }: { label: string; colors: ReturnType<typeof useTheme>["colors"]; testID?: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>{label}</Text>
      <TextInput
        {...props}
        testID={testID}
        style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  logo: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  heading: { fontSize: 29, lineHeight: 36, fontWeight: "800", letterSpacing: -0.6 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  switcher: { flexDirection: "row", padding: 4, borderRadius: 15, marginTop: 28, marginBottom: 22 },
  switch: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 42, borderRadius: 12 },
  switchText: { fontSize: 14, fontWeight: "800" },
  field: { marginBottom: 15 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: 1, minHeight: 52, borderRadius: 15, paddingHorizontal: 15, fontSize: 15 },
  error: { fontSize: 13, marginTop: 8, lineHeight: 19 },
  button: { minHeight: 54, borderRadius: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 22 },
  buttonText: { fontSize: 15, fontWeight: "800" },
  forgotText: { fontSize: 12, textAlign: "center", marginTop: 18 },
  pressed: { opacity: 0.82 },
});
