import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../src/api";
import { c, f } from "../../src/theme";
import { Empty, Eyebrow, H1, IconCircle, Screen } from "../../src/ui";

export default function QuizResults() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api(`/api/quizzes/${id}/results`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <IconCircle name="chevron-back" label="Back" onPress={() => router.back()} />
      </View>
      {error ? (
        <Text style={{ fontFamily: f.medium, color: c.danger, padding: 20 }}>{error}</Text>
      ) : !data ? (
        <ActivityIndicator color={c.purple} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <Eyebrow>Results</Eyebrow>
          <H1 style={{ marginTop: 6, marginBottom: 22 }}>{data.title}</H1>

          <Text style={sec}>Leaderboard</Text>
          {data.leaderboard.length === 0 && <Empty title="No one yet" text="Share your link and watch the scores roll in." />}
          {data.leaderboard.map((r, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: i === 0 ? c.lavender : c.white, borderWidth: 1.5, borderColor: i === 0 ? c.purple : c.line, borderRadius: 22, padding: 14, marginBottom: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: i === 0 ? c.purple : c.fill, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: f.display, fontSize: 16, color: i === 0 ? c.white : c.ink }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontFamily: f.display, fontSize: 18, color: c.ink }}>{r.name}</Text>
                {i === 0 && <Text style={{ fontFamily: f.semi, fontSize: 11, letterSpacing: 0.6, color: c.purple }}>CURRENT BESTIE</Text>}
              </View>
              <View style={{ backgroundColor: c.lime, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Text style={{ fontFamily: f.display, fontSize: 18, color: c.ink }}>{r.score}/{r.total}</Text>
              </View>
            </View>
          ))}

          <Text style={[sec, { marginTop: 24 }]}>How each question went</Text>
          {data.perQuestion.map((q, i) => (
            <View key={i} style={{ backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 22, padding: 16, marginBottom: 10 }}>
              <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.ink }}>{q.text}</Text>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: c.fill, marginTop: 12, overflow: "hidden" }}>
                <View style={{ width: `${q.percentCorrect}%`, height: 8, backgroundColor: c.purple }} />
              </View>
              <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 8 }}>{q.percentCorrect}% got it right</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const sec = { fontFamily: f.display, fontSize: 22, color: c.ink, marginBottom: 12 };
