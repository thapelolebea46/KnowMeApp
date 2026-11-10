import { useCallback, useState } from "react";
import { FlatList, Share, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { api, setToken, WEB } from "../src/api";
import { s, c } from "../src/theme";

export default function Home() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState("");

  useFocusEffect(
    useCallback(() => {
      api("/api/quizzes/mine").then(setQuizzes).catch((e) => setError(e.message));
    }, [])
  );

  const share = (q) =>
    Share.share({ message: `Think you know me? Take my quiz: ${WEB}/q/${q.code}` });

  async function logout() {
    await setToken(null);
    router.replace("/");
  }

  return (
    <View style={s.screen}>
      {!!error && <Text style={s.error}>{error}</Text>}
      <FlatList
        data={quizzes}
        keyExtractor={(q) => q.id}
        ListEmptyComponent={<Text style={s.muted}>No quizzes yet. Create your first one below.</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.h2}>{item.title}</Text>
            <Text style={s.muted}>{item.questionCount} questions · {item.attempts} answered</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[s.btn, { flex: 1 }]} onPress={() => share(item)}>
                <Text style={s.btnText}>Share link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, { flex: 1, backgroundColor: "#fff" }]} onPress={() => router.push(`/quiz/${item.id}`)}>
                <Text style={s.btnText}>Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={[s.btn, { backgroundColor: c.pink }]} onPress={() => router.push("/create")}>
        <Text style={[s.btnText, { color: "#fff" }]}>Create a quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout} style={{ padding: 14, alignItems: "center" }}>
        <Text style={{ color: c.ink, textDecorationLine: "underline" }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
