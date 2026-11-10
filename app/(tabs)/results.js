import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api";
import { c, f } from "../../src/theme";
import { Empty, Eyebrow, H1, Screen } from "../../src/ui";

export default function Results() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() =>
    api("/api/quizzes/mine").then((d) => { setQuizzes(d); setError(""); }).catch((e) => setError(e.message)), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const friends = quizzes.reduce((n, q) => n + (q.attempts || 0), 0);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.purple} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Eyebrow>The scoreboard</Eyebrow>
        <H1 style={{ marginTop: 6 }}>Who knows{"\n"}you best?</H1>

        <View style={{ flexDirection: "row", gap: 12, marginVertical: 22 }}>
          <View style={{ flex: 1, backgroundColor: c.purple, borderRadius: 24, padding: 18 }}>
            <Text style={{ fontFamily: f.display, fontSize: 36, color: c.white }}>{friends}</Text>
            <Text style={{ fontFamily: f.medium, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>answers from friends</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: c.lime, borderRadius: 24, padding: 18 }}>
            <Text style={{ fontFamily: f.display, fontSize: 36, color: c.ink }}>{quizzes.length}</Text>
            <Text style={{ fontFamily: f.medium, fontSize: 13, color: c.ink }}>quizzes live</Text>
          </View>
        </View>

        {!!error && <Text style={{ fontFamily: f.medium, color: c.danger, marginBottom: 10 }}>{error}</Text>}
        {quizzes.length === 0 && !error && <Empty title="No results yet" text="Share a quiz and the scores will land here." />}

        {quizzes.map((q) => (
          <Pressable key={q.id} onPress={() => router.push(`/quiz/${q.id}`)}
            style={{ flexDirection: "row", alignItems: "center", backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 22, padding: 16, marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontFamily: f.display, fontSize: 18, color: c.ink }}>{q.title}</Text>
              <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 3 }}>{q.attempts} friend{q.attempts === 1 ? "" : "s"} played</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}
