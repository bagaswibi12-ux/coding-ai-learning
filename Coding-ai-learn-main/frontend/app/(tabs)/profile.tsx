import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";

import { api } from "@/src/api";
import { Screen, TopBar } from "@/src/components/primitives";
import { useSession } from "@/src/session";
import { makeStyles, setColorScheme, useTheme } from "@/src/theme";
import { storage } from "@/src/utils/storage";

export default function Profile() {
  const { user, signOut, refresh } = useSession();
  const { colors, scheme } = useTheme();
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [dark, setDark] = useState(scheme === "dark");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    storage.getItem("syntaxai_theme", "" as string).then((value) => {
      if (value === "dark" || value === "light") { setDark(value === "dark"); setColorScheme(value); }
    });
  }, []);

  if (!user) return null;

  const toggleTheme = async () => {
    const next = !dark;
    setDark(next);
    setColorScheme(next ? "dark" : "light");
    await storage.setItem("syntaxai_theme", next ? "dark" : "light");
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.profile({ name });
      await refresh();
      setMessage("Profil diperbarui.");
      setEditing(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.deleteAccount();
      await signOut();
      router.replace("/auth");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menghapus akun.");
    }
  };

  return (
    <Screen>
      <TopBar title="Profil" subtitle="Atur ruang belajar sesuai kebutuhanmu" />
      <View style={[styles.profileCard, { backgroundColor: colors.brandTertiary }]} testID="profile-card">
        <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.avatarText, { color: colors.onBrandTertiary }]}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: colors.onBrandTertiary }]} testID="profile-name">{user.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.onBrandTertiary }]}>{user.email}</Text>
          <Text style={[styles.profileLevel, { color: colors.onBrandTertiary }]}>{user.level_name} • {user.xp} XP</Text>
        </View>
      </View>
      {editing ? (
        <View style={styles.editRow} testID="profile-edit-row">
          <TextInput testID="profile-name-input" value={name} onChangeText={setName} style={[styles.editInput, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, color: colors.onSurface }]} />
          <Pressable testID="profile-save-button" onPress={save} disabled={saving} style={[styles.saveButton, { backgroundColor: colors.brandPrimary }]}>
            <Text style={[styles.saveText, { color: colors.onBrandPrimary }]}>{saving ? "..." : "Simpan"}</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.menu}>
        <MenuRow testID="profile-tutor" icon="robot-happy-outline" title="AI Tutor" detail="Chat untuk minta hint belajar" onPress={() => router.push("/tutor")} colors={colors} />
        <MenuRow testID="profile-leaderboard" icon="trophy-outline" title="Papan peringkat" detail="Lihat posisi dan XP mingguan" onPress={() => router.push("/leaderboard")} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <MenuRow testID="profile-edit" icon="account-edit-outline" title="Edit profil" detail="Nama dan preferensi belajar" onPress={() => setEditing((value) => !value)} colors={colors} />
        <MenuRow testID="profile-bookmarks" icon="bookmark-outline" title="Materi disimpan" detail="Bookmark dan catatan pribadi" onPress={() => router.push("/progress")} colors={colors} />
        <MenuRow testID="profile-history" icon="history" title="Riwayat belajar" detail="Lihat perjalanan belajarmu di Progress" onPress={() => router.push("/progress")} colors={colors} />
        <MenuRow testID="profile-ethics" icon="shield-check-outline" title="Etika & literasi AI" detail="Belajar menggunakan AI dengan bertanggung jawab" onPress={() => router.push("/lesson/ai-lesson-14")} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <MenuRow testID="profile-theme" icon={dark ? "weather-sunny" : "weather-night"} title={dark ? "Gunakan light mode" : "Gunakan dark mode"} detail="Tampilan nyaman untuk belajar" onPress={toggleTheme} colors={colors} />
        <MenuRow testID="profile-about" icon="information-outline" title="Tentang SyntaxAI" detail="Media belajar coding dan AI untuk SMA/SMK" colors={colors} />
        <MenuRow testID="profile-logout" icon="logout" title="Keluar" detail="Akhiri sesi di perangkat ini" onPress={() => signOut().then(() => router.replace("/auth"))} danger colors={colors} />
      </View>
      {!confirmDelete ? (
        <Pressable testID="profile-delete-button" onPress={() => setConfirmDelete(true)} style={styles.delete}>
          <Text style={[styles.deleteText, { color: colors.error }]}>Hapus akun dan semua data</Text>
        </Pressable>
      ) : (
        <View style={[styles.confirm, { backgroundColor: colors.surfaceSecondary, borderColor: colors.error }]} testID="profile-delete-confirm">
          <Text style={[styles.confirmTitle, { color: colors.error }]}>Yakin ingin hapus akun?</Text>
          <Text style={[styles.confirmBody, { color: colors.onSurfaceSecondary }]}>Semua progress, XP, bookmark, dan catatan akan dihapus permanen.</Text>
          <View style={styles.confirmRow}>
            <Pressable testID="profile-delete-cancel" onPress={() => setConfirmDelete(false)} style={[styles.confirmBtn, { borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.confirmBtnText, { color: colors.onSurface }]}>Batal</Text>
            </Pressable>
            <Pressable testID="profile-delete-confirm-button" onPress={remove} style={[styles.confirmBtn, { backgroundColor: colors.error }]}>
              <Text style={[styles.confirmBtnText, { color: colors.onError }]}>Hapus akun</Text>
            </Pressable>
          </View>
        </View>
      )}
      {message ? <Text testID="profile-message" style={[styles.message, { color: colors.success }]}>{message}</Text> : null}
    </Screen>
  );
}

function MenuRow({ icon, title, detail, onPress, colors, danger = false, testID }: { icon: string; title: string; detail: string; onPress?: () => void; colors: ReturnType<typeof useTheme>["colors"]; danger?: boolean; testID?: string }) {
  const styles = useStyles();
  return (
    <Pressable testID={testID} onPress={onPress} style={styles.menuRow}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.surfaceTertiary : colors.brandTertiary }]}>
        <MaterialCommunityIcons name={icon as any} size={21} color={danger ? colors.error : colors.onBrandTertiary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuTitle, { color: danger ? colors.error : colors.onSurface }]}>{title}</Text>
        <Text style={[styles.menuDetail, { color: colors.muted }]}>{detail}</Text>
      </View>
      {onPress ? <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} /> : null}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  profileCard: { minHeight: 130, borderRadius: 22, padding: 17, flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 68, height: 68, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 28, fontWeight: "900" },
  profileName: { fontSize: 20, fontWeight: "800" },
  profileEmail: { fontSize: 12, marginTop: 5 },
  profileLevel: { fontSize: 12, fontWeight: "700", marginTop: 9 },
  editRow: { flexDirection: "row", gap: 8, marginTop: 13 },
  editInput: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13 },
  saveButton: { minWidth: 80, minHeight: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveText: { fontWeight: "800", fontSize: 12 },
  menu: { marginTop: 21, gap: 4 },
  menuRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12 },
  menuIcon: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  menuTitle: { fontSize: 14, fontWeight: "800" },
  menuDetail: { fontSize: 11, marginTop: 3 },
  divider: { height: 1, marginVertical: 8 },
  delete: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 17 },
  deleteText: { fontSize: 12, fontWeight: "800" },
  confirm: { marginTop: 17, borderWidth: 1, borderRadius: 16, padding: 14 },
  confirmTitle: { fontSize: 14, fontWeight: "800" },
  confirmBody: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  confirmRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  confirmBtn: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { fontSize: 13, fontWeight: "800" },
  message: { fontSize: 13, textAlign: "center", marginTop: 14 },
}));
