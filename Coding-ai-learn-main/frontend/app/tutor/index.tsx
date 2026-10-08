import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/api";
import { TopBar } from "@/src/components/primitives";
import { makeStyles, useTheme } from "@/src/theme";

type Message = { role: "user" | "assistant"; content: string; at?: string };

const SUGGESTIONS = [
  "Jelaskan apa itu loop di Python",
  "Beri hint, kodeku error IndentationError",
  "Perbedaan == dan = dalam Python",
  "Apa itu Machine Learning dalam bahasa sederhana?",
];

export default function Tutor() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [conversationId, setConversationId] = useState<string | undefined>(params.id as string | undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<ScrollView | null>(null);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const conv = await api.tutorConversation(id);
      setMessages(conv.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat percakapan.");
    }
  }, []);

  useEffect(() => {
    if (conversationId) loadConversation(conversationId);
  }, [conversationId, loadConversation]);

  const send = async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || sending) return;
    setError("");
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setSending(true);
    try {
      const result = await api.tutorMessage({ message: trimmed, conversation_id: conversationId });
      setConversationId(result.conversation_id);
      setMessages([...next, { role: "assistant", content: result.reply, at: result.updated_at }]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
      setMessages(messages);
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.surface }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 18 }}>
        <TopBar
          title="AI Tutor"
          subtitle="Tanya konsep, error, atau minta hint"
          back
          action={
            <Pressable testID="tutor-history-button" onPress={() => router.push("/tutor/history")} style={[styles.action, { backgroundColor: colors.surfaceTertiary }]}>
              <MaterialCommunityIcons name="history" size={20} color={colors.brandPrimary} />
            </Pressable>
          }
        />
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 10 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        testID="tutor-messages"
      >
        {messages.length === 0 ? (
          <View style={[styles.welcome, { backgroundColor: colors.brandTertiary }]} testID="tutor-welcome">
            <MaterialCommunityIcons name="robot-happy-outline" size={32} color={colors.onBrandTertiary} />
            <Text style={[styles.welcomeTitle, { color: colors.onBrandTertiary }]}>Halo! Aku SyntaxAI Tutor.</Text>
            <Text style={[styles.welcomeText, { color: colors.onBrandTertiary }]}>Aku lebih sering balik bertanya biar kamu paham sendiri. Mulai dari salah satu topik berikut:</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {SUGGESTIONS.map((item) => (
                <Pressable key={item} testID={`tutor-suggestion-${SUGGESTIONS.indexOf(item)}`} onPress={() => send(item)} style={[styles.suggestion, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="arrow-right" size={16} color={colors.brandPrimary} />
                  <Text style={[styles.suggestionText, { color: colors.onSurface }]}>{item}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
        {messages.map((item, idx) => (
          <View key={idx} testID={`tutor-msg-${idx}`} style={[styles.bubble, item.role === "user" ? { backgroundColor: colors.brandPrimary, alignSelf: "flex-end" } : { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1, alignSelf: "flex-start" }]}>
            <Text style={[styles.bubbleText, { color: item.role === "user" ? colors.onBrandPrimary : colors.onSurfaceSecondary }]}>{item.content}</Text>
          </View>
        ))}
        {sending ? (
          <View style={[styles.bubble, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, borderWidth: 1, alignSelf: "flex-start", flexDirection: "row", gap: 8, alignItems: "center" }]} testID="tutor-typing">
            <ActivityIndicator color={colors.brandPrimary} />
            <Text style={{ color: colors.muted, fontSize: 13 }}>Tutor mengetik...</Text>
          </View>
        ) : null}
        {error ? <Text testID="tutor-error" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      </ScrollView>
      <View style={[styles.inputRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          testID="tutor-input"
          value={input}
          onChangeText={setInput}
          placeholder="Tanya tutor..."
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.onSurface, backgroundColor: colors.surface, borderColor: colors.border }]}
          multiline
          maxLength={1800}
          editable={!sending}
        />
        <Pressable testID="tutor-send-button" onPress={() => send()} disabled={sending || !input.trim()} style={[styles.sendButton, { backgroundColor: colors.brandPrimary }, (sending || !input.trim()) && { opacity: 0.5 }]}>
          <MaterialCommunityIcons name="send" size={20} color={colors.onBrandPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  action: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  welcome: { borderRadius: 20, padding: 18, gap: 10 },
  welcomeTitle: { fontSize: 18, fontWeight: "800", marginTop: 6 },
  welcomeText: { fontSize: 13, lineHeight: 19 },
  suggestion: { minHeight: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  suggestionText: { fontSize: 13, fontWeight: "600", flex: 1 },
  bubble: { maxWidth: "88%", borderRadius: 16, padding: 12 },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  error: { fontSize: 13, marginTop: 6 },
  inputRow: { borderTopWidth: 1, paddingHorizontal: 12, paddingTop: 10, gap: 8, flexDirection: "row", alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderRadius: 16, minHeight: 46, maxHeight: 110, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  sendButton: { width: 48, height: 46, borderRadius: 15, alignItems: "center", justifyContent: "center" },
}));
