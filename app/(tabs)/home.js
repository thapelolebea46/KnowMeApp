import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, getUserName, setToken } from "../../src/api";
import { c, f } from "../../src/theme";
import { ActionSheet, Button, Empty, Eyebrow, H1, Screen, Sub } from "../../src/ui";
import QuizCard from "../../src/QuizCard";

export default function Home() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [menu, setMenu] = useState(false);
  const name = getUserName();
  const first = name.split(" ")[0] || "you";

  const load = useCallback(() =>
    api("/api/quizzes/mine").then((d) => { setQuizzes(d); setError(""); }).catch((e) => setError(e.message)), []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function logout() {
    await setToken(null);
    router.replace("/");
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.purple} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Eyebrow>Hey, {first}</Eyebrow>
          <Pressable onPress={() => setMenu(true)} accessibilityLabel="Account menu"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.lavender, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: f.display, fontSize: 17, color: c.purple }}>{first[0]?.toUpperCase()}</Text>
          </Pressable>
        </View>

        <H1>Big main-character energy.</H1>
        <Sub style={{ marginTop: 10 }}>Let your friends prove they know the real you.</Sub>

        {/* Hero */}
        <View style={{ backgroundColor: c.purple, borderRadius: 32, padding: 24, marginTop: 22, overflow: "hidden" }}>
          <Text style={{ position: "absolute", right: 0, top: 10, fontFamily: f.display, fontSize: 230, color: "rgba(255,255,255,0.14)" }}>?</Text>
          <Eyebrow color={c.lime}>The friendship test</Eyebrow>
          <Text style={{ fontFamily: f.display, fontSize: 30, lineHeight: 33, color: c.white, marginTop: 14, letterSpacing: -0.4 }}>
            You make the quiz.{"\n"}They spill the truth.
          </Text>
          <Text style={{ fontFamily: f.body, fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 16, marginBottom: 18 }}>
            8 questions. Endless “you know me so well”.
          </Text>
          <Button tone="lime" label="Create a quiz" icon="add" onPress={() => router.push("/create")} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 32, marginBottom: 14 }}>
          <Text style={{ fontFamily: f.display, fontSize: 24, color: c.ink }}>Your quizzes</Text>
          {quizzes.length > 0 && (
            <Pressable onPress={() => router.push("/quizzes")}>
              <Text style={{ fontFamily: f.semi, fontSize: 14, color: c.purple }}>See all</Text>
            </Pressable>
          )}
        </View>

        {!!error && <Text style={{ fontFamily: f.medium, color: c.danger, marginBottom: 10 }}>{error}</Text>}
        {quizzes.length === 0 && !error && <Empty title="No quizzes yet" text="Create your first one and send it to your circle." />}
        {quizzes.slice(0, 3).map((q) => (
          <QuizCard key={q.id} quiz={q} onPress={() => router.push(`/quiz/${q.id}`)} />
        ))}
      </ScrollView>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={name || "Account"}
        actions={[{ label: "Log out", icon: "log-out-outline", danger: true, onPress: logout }]}
      />
    </Screen>
  );
}
