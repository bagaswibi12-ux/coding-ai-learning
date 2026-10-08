import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { storage } from "@/src/utils/storage";
import { useTheme } from "@/src/theme";

const slides = [
  { icon: "code-tags", title: "Belajar Coding dari Nol", body: "Pelajari konsep coding sedikit demi sedikit dengan penjelasan yang mudah dipahami." },
  { icon: "play-circle-outline", title: "Praktik Langsung", body: "Tulis kode, jalankan contoh, dan temukan cara kerja program melalui simulator." },
  { icon: "brain", title: "Kenali Dunia AI", body: "Pahami Artificial Intelligence, Machine Learning, dan cara menggunakannya dengan bertanggung jawab." },
];
const experiences = ["Belum pernah coding", "Pernah mencoba sedikit", "Sudah memahami dasar", "Sudah pernah membuat project"];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState(experiences[0]);
  const slide = slides[Math.min(step, slides.length - 1)];
  const finish = async () => {
    await storage.setItem("syntaxai_onboarding", true);
    await storage.setItem("syntaxai_experience", experience);
    router.replace("/auth");
  };
  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="onboarding-screen">
      <LinearGradient colors={[colors.brandTertiary, colors.surface]} style={[styles.hero, { paddingTop: insets.top + 28 }]}>
        <View style={[styles.mark, { backgroundColor: colors.surfaceSecondary }]}>
          <MaterialCommunityIcons name={slide.icon as any} size={86} color={colors.brandPrimary} />
        </View>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View key={index} style={[styles.dot, { backgroundColor: index === step ? colors.brandPrimary : colors.border }]} />
          ))}
        </View>
      </LinearGradient>
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.kicker, { color: colors.brandPrimary }]}>SYNTAXAI SMA</Text>
        <Text style={[styles.title, { color: colors.onSurface }]} testID="onboarding-title">
          {step < slides.length ? slide.title : "Seberapa jauh pengalamanmu?"}
        </Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          {step < slides.length ? slide.body : "Kami akan menyesuaikan rekomendasi belajar, tetapi semua materi tetap bisa kamu buka."}
        </Text>
        {step === slides.length ? (
          <View style={styles.experienceList}>
            {experiences.map((item) => (
              <Pressable key={item} testID={`onboarding-exp-${experiences.indexOf(item)}`} onPress={() => setExperience(item)} style={[styles.experience, { backgroundColor: experience === item ? colors.brandTertiary : colors.surfaceSecondary, borderColor: experience === item ? colors.brandPrimary : colors.border }]}>
                <MaterialCommunityIcons name={experience === item ? "radiobox-marked" : "radiobox-blank"} size={22} color={experience === item ? colors.brandPrimary : colors.muted} />
                <Text style={[styles.experienceText, { color: colors.onSurfaceSecondary }]}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Pressable testID="onboarding-next-button" onPress={step < slides.length ? () => setStep(step + 1) : finish} style={({ pressed }) => [styles.button, { backgroundColor: colors.brandPrimary }, pressed && styles.pressed]}>
          <Text style={[styles.buttonText, { color: colors.onBrandPrimary }]}>{step < slides.length ? "Lanjut" : "Mulai Belajar"}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onBrandPrimary} />
        </Pressable>
        {step < slides.length ? (
          <Pressable testID="onboarding-skip-button" onPress={finish} style={styles.skip}>
            <Text style={[styles.skipText, { color: colors.muted }]}>Lewati untuk sekarang</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { flex: 1.05, alignItems: "center", justifyContent: "center", gap: 34 },
  mark: { width: 188, height: 188, borderRadius: 94, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 28, height: 6, borderRadius: 99 },
  content: { paddingHorizontal: 24, paddingTop: 28 },
  kicker: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4, marginBottom: 10 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -0.6 },
  body: { fontSize: 16, lineHeight: 25, marginTop: 12 },
  experienceList: { gap: 10, marginTop: 22 },
  experience: { minHeight: 50, borderWidth: 1, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  experienceText: { fontSize: 14, fontWeight: "600" },
  button: { minHeight: 52, borderRadius: 18, marginTop: 28, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  buttonText: { fontSize: 16, fontWeight: "800" },
  skip: { minHeight: 44, alignItems: "center", justifyContent: "center", marginTop: 6 },
  skipText: { fontSize: 14, fontWeight: "600" },
  pressed: { opacity: 0.82 },
});
