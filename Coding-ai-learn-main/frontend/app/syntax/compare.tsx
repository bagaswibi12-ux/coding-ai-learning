import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { Pill, Screen, SectionTitle, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type Concept = { id: string; title: string; description: string; samples: { language: string; code: string }[] };

const concepts: Concept[] = [
  {
    id: "output",
    title: "Menampilkan teks",
    description: "Satu tujuan — mencetak 'Hello' — ditulis beda di tiap bahasa.",
    samples: [
      { language: "Python", code: 'print("Hello")' },
      { language: "JavaScript", code: 'console.log("Hello")' },
      { language: "C++", code: 'cout << "Hello";' },
      { language: "Java", code: 'System.out.println("Hello");' },
      { language: "HTML", code: '<p>Hello</p>' },
    ],
  },
  {
    id: "variable",
    title: "Membuat variable",
    description: "Deklarasi dan tipe berbeda antar bahasa.",
    samples: [
      { language: "Python", code: 'nama = "Rina"' },
      { language: "JavaScript", code: 'const nama = "Rina"' },
      { language: "C++", code: 'string nama = "Rina";' },
      { language: "Java", code: 'String nama = "Rina";' },
    ],
  },
  {
    id: "if",
    title: "Percabangan if",
    description: "Mengambil keputusan berdasarkan kondisi.",
    samples: [
      { language: "Python", code: 'if nilai >= 75:\n    print("Lulus")' },
      { language: "JavaScript", code: 'if (nilai >= 75) {\n  console.log("Lulus")\n}' },
      { language: "C++", code: 'if (nilai >= 75) {\n  cout << "Lulus";\n}' },
      { language: "Java", code: 'if (nilai >= 75) {\n  System.out.println("Lulus");\n}' },
    ],
  },
  {
    id: "loop",
    title: "Looping 0..2",
    description: "Mengulang blok kode beberapa kali.",
    samples: [
      { language: "Python", code: 'for i in range(3):\n    print(i)' },
      { language: "JavaScript", code: 'for (let i = 0; i < 3; i++) {\n  console.log(i)\n}' },
      { language: "C++", code: 'for (int i = 0; i < 3; i++) {\n  cout << i;\n}' },
      { language: "Java", code: 'for (int i = 0; i < 3; i++) {\n  System.out.println(i);\n}' },
    ],
  },
  {
    id: "function",
    title: "Membuat fungsi",
    description: "Fungsi tambah(a, b) yang mengembalikan a+b.",
    samples: [
      { language: "Python", code: 'def tambah(a, b):\n    return a + b' },
      { language: "JavaScript", code: 'function tambah(a, b) {\n  return a + b;\n}' },
      { language: "C++", code: 'int tambah(int a, int b) {\n  return a + b;\n}' },
      { language: "Java", code: 'int tambah(int a, int b) {\n  return a + b;\n}' },
    ],
  },
];

export default function CompareSyntax() {
  const { colors } = useTheme();
  const styles = useStyles();
  const [selected, setSelected] = useState(concepts[0].id);
  const concept = concepts.find((item) => item.id === selected) || concepts[0];
  return (
    <Screen>
      <TopBar title="Bandingkan syntax" subtitle="Satu konsep, banyak cara menulis" back />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {concepts.map((item) => (
          <Pill key={item.id} label={item.title} active={item.id === selected} onPress={() => setSelected(item.id)} />
        ))}
      </ScrollView>
      <View style={[styles.hero, { backgroundColor: colors.brandTertiary }]} testID="compare-hero">
        <MaterialCommunityIcons name="compare-horizontal" size={28} color={colors.onBrandTertiary} />
        <Text style={[styles.heroTitle, { color: colors.onBrandTertiary }]}>{concept.title}</Text>
        <Text style={[styles.heroText, { color: colors.onBrandTertiary }]}>{concept.description}</Text>
      </View>
      <SectionTitle title="Contoh lintas bahasa" />
      {concept.samples.map((item) => (
        <View key={item.language} style={[styles.row, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.language, { color: colors.onSurface }]}>{item.language}</Text>
          <Text selectable style={[styles.code, { color: colors.brandPrimary }]}>{item.code}</Text>
        </View>
      ))}
      <Text style={[styles.tip, { color: colors.muted }]}>Konsepnya sama; perbedaan terletak di gaya penulisan masing-masing bahasa.</Text>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  filters: { gap: 8, paddingRight: 8, flexDirection: "row", marginBottom: 14 },
  hero: { borderRadius: 20, padding: 18 },
  heroTitle: { fontSize: 19, fontWeight: "800", marginTop: 10 },
  heroText: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  row: { minHeight: 72, borderRadius: 16, borderWidth: 1, padding: 13, marginBottom: 9 },
  language: { fontSize: 12, fontWeight: "800" },
  code: { fontFamily: "monospace", fontSize: 13, lineHeight: 20, marginTop: 6 },
  tip: { fontSize: 13, lineHeight: 20, marginTop: 15 },
}));
