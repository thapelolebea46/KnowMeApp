import { useState } from "react";
import { ScrollView, Share, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { api, WEB } from "../src/api";
import { s, c } from "../src/theme";

const blank = () => ({ text: "", options: ["", "", "", ""], correctIndex: 0 });

export default function Create() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [qs, setQs] = useState([blank()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (i, patch) => setQs(qs.map((q, k) => (k === i ? { ...q, ...patch } : q)));
  const setOpt = (i, j, v) => update(i, { options: qs[i].options.map((o, k) => (k === j ? v : o)) });

  async function save() {
    setError("");
    // drop empty trailing options, keep the correct index valid
    const questions = qs.map((q) => {
      const filled = q.options.map((o, idx) => ({ o: o.trim(), idx })).filter((x) => x.o);
      return {
        text: q.text,
        options: filled.map((x) => x.o),
        correctIndex: filled.findIndex((x) => x.idx === q.correctIndex),
      };
    });
    setBusy(true);
    try {
      const { code } = await api("/api/quizzes", { method: "POST", body: { title, questions } });
      await Share.share({ message: `Think you know me? Take my quiz: ${WEB}/q/${code}` });
      router.replace("/home");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
      <TextInput style={s.input} placeholder="Quiz title, e.g. How well do you know me?" value={title} onChangeText={setTitle} />
      {qs.map((q, i) => (
        <View key={i} style={s.card}>
          <Text style={s.h2}>Question {i + 1}</Text>
          <TextInput style={[s.input, { marginTop: 8 }]} placeholder="Ask something" value={q.text} onChangeText={(v) => update(i, { text: v })} />
          <Text style={[s.muted, { marginBottom: 6 }]}>Tap the circle next to the right answer.</Text>
          {q.options.map((o, j) => (
            <View key={j} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                onPress={() => update(i, { correctIndex: j })}
                accessibilityLabel={`Mark option ${j + 1} as correct`}
                style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: c.ink,
                  backgroundColor: q.correctIndex === j ? c.pink : "#fff", marginBottom: 12 }}
              />
              <TextInput style={[s.input, { flex: 1 }]} placeholder={`Option ${j + 1}${j > 1 ? " (optional)" : ""}`} value={o} onChangeText={(v) => setOpt(i, j, v)} />
            </View>
          ))}
          {qs.length > 1 && (
            <TouchableOpacity onPress={() => setQs(qs.filter((_, k) => k !== i))}>
              <Text style={{ color: "#c0153f", fontWeight: "600" }}>Remove question</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {qs.length < 20 && (
        <TouchableOpacity style={[s.btn, { backgroundColor: "#fff" }]} onPress={() => setQs([...qs, blank()])}>
          <Text style={s.btnText}>Add question</Text>
        </TouchableOpacity>
      )}
      {!!error && <Text style={[s.error, { marginTop: 12 }]}>{error}</Text>}
      <TouchableOpacity style={[s.btn, { marginTop: 12 }]} onPress={save} disabled={busy}>
        <Text style={s.btnText}>{busy ? "Saving…" : "Save and share"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
