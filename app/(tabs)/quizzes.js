import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { c, f } from "../../src/theme";
import { Empty, Eyebrow, H1, Screen } from "../../src/ui";
import QuizCard from "../../src/QuizCard";

export default function MyQuizzes() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() =>
    api("/api/quizzes/mine").then((d) => { setQuizzes(d); setError(""); }).catch((e) => setError(e.message)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.purple} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Eyebrow>Your collection</Eyebrow>
        <H1 style={{ marginTop: 6, marginBottom: 20 }}>My quizzes.</H1>
        {!!error && <Text style={{ fontFamily: f.medium, color: c.danger, marginBottom: 10 }}>{error}</Text>}
        {quizzes.length === 0 && !error && <Empty title="Nothing here yet" text="Make a quiz and it will show up right here." />}
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} actions onPress={() => router.push(`/quiz/${q.id}`)} />
        ))}
        <Pressable
          onPress={() => router.push("/create")}
          style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: c.purple, borderRadius: 22, paddingVertical: 18, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", backgroundColor: c.fill }}
        >
          <Ionicons name="add" size={20} color={c.purple} />
          <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.purple }}>Create a quiz</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
