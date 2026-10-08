import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { api } from "@/src/api";
import { ProgressBar, Screen, TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type QuizData = Awaited<ReturnType<typeof api.quiz>>;

export default function Quiz() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api.quiz(id).then(setQuiz).catch((err) => setError(err instanceof Error ? err.message : "Kuis belum tersedia.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <View style={[styles.loading, { backgroundColor: colors.surface }]}><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (!quiz) return <Screen><TopBar title="Kuis" back /><Text style={{ color: colors.muted }}>{error || "Kuis belum tersedia."}</Text></Screen>;

  if (result !== null) {
    return (
      <Screen>
        <TopBar title="Hasil kuis" back />
        <View style={[styles.result, { backgroundColor: colors.brandTertiary }]} testID="quiz-result">
          <MaterialCommunityIcons name={result >= 70 ? "trophy-outline" : "refresh-circle"} size={54} color={colors.onBrandTertiary} />
          <Text style={[styles.resultScore, { color: colors.onBrandTertiary }]} testID="quiz-score">{result}</Text>
          <Text style={[styles.resultLabel, { color: colors.onBrandTertiary }]}>Nilai kamu</Text>
          <Text style={[styles.resultText, { color: colors.onBrandTertiary }]}>
            {result >= 90 ? "Luar biasa! Pemahamanmu sangat kuat." : result >= 70 ? "Keren! Pemahamanmu sudah cukup kuat." : "Tidak apa-apa. Baca lagi materinya dan coba ulang."}
          </Text>
        </View>
        <Pressable testID="quiz-back-button" onPress={() => router.back()} style={[styles.primary, { backgroundColor: colors.brandPrimary }]}>
          <Text style={[styles.primaryText, { color: colors.onBrandPrimary }]}>Kembali belajar</Text>
        </Pressable>
      </Screen>
    );
  }

  const question = quiz.questions[index];

  const next = async () => {
    if (!reveal) {
      setReveal(true);
      return;
    }
    const nextAnswers = [...answers, selected ?? -1];
    setReveal(false);
    if (index < quiz.questions.length - 1) {
      setAnswers(nextAnswers);
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    const correct = nextAnswers.filter((answer, answerIndex) => answer === quiz.questions[answerIndex].answer).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    try {
      await api.quizResult({ quiz_id: quiz.id, score, correct_answers: correct, wrong_answers: quiz.questions.length - correct });
    } catch {}
    setResult(score);
  };

  return (
    <Screen>
      <TopBar title={quiz.title} subtitle={`Pertanyaan ${index + 1} dari ${quiz.questions.length}`} back />
      <ProgressBar value={((index + 1) / quiz.questions.length) * 100} />
      <Text style={[styles.question, { color: colors.onSurface }]} testID="quiz-question">{question.question}</Text>
      {question.options.map((option, optionIndex) => {
        const isSelected = selected === optionIndex;
        const isCorrect = reveal && optionIndex === question.answer;
        const isWrong = reveal && isSelected && optionIndex !== question.answer;
        const bg = isCorrect ? colors.success : isWrong ? colors.error : isSelected ? colors.brandTertiary : colors.surfaceSecondary;
        const border = isCorrect ? colors.success : isWrong ? colors.error : isSelected ? colors.brandPrimary : colors.border;
        return (
          <Pressable
            key={option}
            testID={`quiz-option-${optionIndex}`}
            disabled={reveal}
            onPress={() => setSelected(optionIndex)}
            style={[styles.option, { backgroundColor: bg, borderColor: border }]}
          >
            <View style={[styles.optionNumber, { backgroundColor: isSelected || isCorrect ? colors.brandPrimary : colors.surfaceTertiary }]}>
              <Text style={[styles.optionNumberText, { color: isSelected || isCorrect ? colors.onBrandPrimary : colors.muted }]}>{String.fromCharCode(65 + optionIndex)}</Text>
            </View>
            <Text style={[styles.optionText, { color: (isCorrect || isWrong) ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>{option}</Text>
          </Pressable>
        );
      })}
      {reveal ? (
        <View style={[styles.explanation, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} testID="quiz-explanation">
          <Text style={[styles.explanationLabel, { color: colors.muted }]}>PENJELASAN</Text>
          <Text style={[styles.explanationText, { color: colors.onSurfaceSecondary }]}>{question.explanation}</Text>
        </View>
      ) : null}
      <Pressable
        testID="quiz-next-button"
        disabled={selected === null}
        onPress={next}
        style={[styles.primary, { backgroundColor: colors.brandPrimary }, selected === null && { opacity: 0.45 }]}
      >
        <Text style={[styles.primaryText, { color: colors.onBrandPrimary }]}>
          {reveal ? (index === quiz.questions.length - 1 ? "Lihat hasil" : "Lanjut") : "Cek jawaban"}
        </Text>
        <MaterialCommunityIcons name="arrow-right" size={19} color={colors.onBrandPrimary} />
      </Pressable>
    </Screen>
  );
}

const useStyles = makeStyles((colors) => ({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  question: { fontSize: 20, lineHeight: 28, fontWeight: "800", marginTop: 24, marginBottom: 17 },
  option: { minHeight: 62, borderWidth: 1, borderRadius: 17, padding: 11, flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 10 },
  optionNumber: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionNumberText: { fontSize: 13, fontWeight: "900" },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19, fontWeight: "600" },
  explanation: { minHeight: 70, borderWidth: 1, borderRadius: 16, padding: 13, marginTop: 6 },
  explanationLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  explanationText: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  primary: { minHeight: 52, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 20 },
  primaryText: { fontSize: 14, fontWeight: "800" },
  result: { minHeight: 260, borderRadius: 24, alignItems: "center", justifyContent: "center", padding: 24 },
  resultScore: { fontSize: 56, fontWeight: "900", marginTop: 10 },
  resultLabel: { fontSize: 14, fontWeight: "800" },
  resultText: { textAlign: "center", lineHeight: 21, marginTop: 14 },
}));
