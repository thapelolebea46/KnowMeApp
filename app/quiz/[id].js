import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "../../src/api";
import { s, c } from "../../src/theme";

export default function Results() {
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/quizzes/${id}/results`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <View style={s.screen}><Text style={s.error}>{error}</Text></View>;
  if (!data) return <View style={s.screen}><Text style={s.muted}>Loading…</Text></View>;

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={s.h1}>{data.title}</Text>

      <Text style={[s.h2, { marginVertical: 10 }]}>Leaderboard</Text>
      {data.leaderboard.length === 0 && <Text style={s.muted}>No one has answered yet. Share your link.</Text>}
      {data.leaderboard.map((r, i) => (
        <View key={i} style={[s.card, { flexDirection: "row", justifyContent: "space-between" }]}>
          <Text style={s.h2}>{i + 1}. {r.name}</Text>
          <Text style={[s.h2, { color: c.pink }]}>{r.score}/{r.total}</Text>
        </View>
      ))}

      <Text style={[s.h2, { marginVertical: 10 }]}>How each question went</Text>
      {data.perQuestion.map((q, i) => (
        <View key={i} style={s.card}>
          <Text style={{ color: c.ink, fontWeight: "600" }}>{q.text}</Text>
          <Text style={s.muted}>{q.percentCorrect}% got it right</Text>
        </View>
      ))}
    </ScrollView>
  );
}
