import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchPublicQuiz, submitAttempt } from "../../src/api";
import { getDraft } from "../../src/store";
import { c, f } from "../../src/theme";
import { Button, Screen } from "../../src/ui";

const LETTERS = ["A", "B", "C", "D"];
const pad = (n) => String(n).padStart(2, "0");

// What a friend sees. `/play/preview` plays your own just-saved draft locally;
// `/play/<code>` loads a real quiz from the API (see src/api.js).
export default function Play() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const preview = code === "preview";

  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [player, setPlayer] = useState("");
  const [askName, setAskName] = useState(true);
  const [nameDraft, setNameDraft] = useState("");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (preview) {
      const d = getDraft();
      return d ? setQuiz(d) : setError("Nothing to preview yet.");
    }
    fetchPublicQuiz(code).then(setQuiz).catch((e) => setError(e.message));
  }, [code]);

  if (error)
    return (
      <Screen style={{ padding: 24, justifyContent: "center" }}>
        <Text style={{ fontFamily: f.display, fontSize: 26, color: c.ink }}>Couldn’t load this quiz</Text>
        <Text style={{ fontFamily: f.body, fontSize: 15, color: c.muted, marginVertical: 10 }}>{error}</Text>
        <Button label="Go back" onPress={() => router.back()} icon="arrow-back" />
      </Screen>
    );
  if (!quiz)
    return <Screen style={{ justifyContent: "center" }}><ActivityIndicator color={c.purple} /></Screen>;

  const total = quiz.questions.length;
  const q = quiz.questions[i];
  const owner = quiz.ownerName || "Your friend";
  const picked = answers[i];
  const last = i === total - 1;

  async function next() {
    if (picked === undefined) return;
    if (!last) return setI(i + 1);
    if (preview) {
      const score = answers.filter((a, k) => a === quiz.questions[k].correctIndex).length;
      return setResult({ score, total });
    }
    setBusy(true);
    try {
      const r = await submitAttempt(code, { name: player, answers });
      setResult({ score: r.score, total: r.total || total, sent: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (result) return <Done quiz={quiz} result={result} answers={answers} preview={preview} owner={owner} onExit={() => router.back()} />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30, flexGrow: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.ink }}>{owner} challenged you.</Text>
          <Text style={{ fontFamily: f.display, fontSize: 15, color: c.purple }}>{pad(i + 1)} / {pad(total)}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 20 }}>
          {quiz.questions.map((_, k) => (
            <View key={k} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: k <= i ? c.purple : "#E6E1D2" }} />
          ))}
        </View>

        <View style={{ backgroundColor: c.purple, borderRadius: 28, padding: 24, minHeight: 220, justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontFamily: f.semi, fontSize: 12, letterSpacing: 1.2, color: c.lime, textTransform: "uppercase" }}>{quiz.title}</Text>
            <Text style={{ fontFamily: f.display, fontSize: 31, lineHeight: 35, color: c.white, marginTop: 14, letterSpacing: -0.4 }}>{q.text}</Text>
          </View>
          <Text style={{ fontFamily: f.body, fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 24 }}>Go on. You know this one.</Text>
        </View>

        <View style={{ gap: 10, marginTop: 18 }}>
          {q.options.map((o, j) => {
            const on = picked === j;
            return (
              <Pressable key={j} onPress={() => setAnswers((a) => { const n = [...a]; n[i] = j; return n; })}
                style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 20, backgroundColor: on ? c.lavender : c.white, borderWidth: 1.5, borderColor: on ? c.purple : c.line }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: on ? c.purple : "#F0EBE1" }}>
                  <Text style={{ fontFamily: f.semi, fontSize: 14, color: on ? c.white : c.muted }}>{LETTERS[j]}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: on ? f.semi : f.medium, fontSize: 16, color: on ? c.purple : c.ink }}>{o}</Text>
                {on ? (
                  <Ionicons name="checkmark-circle" size={28} color={c.purple} />
                ) : (
                  <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: "#CFC9BA" }} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <Text style={{ textAlign: "center", fontFamily: f.body, fontSize: 13, color: c.muted, marginVertical: 18 }}>
          Playing as {player || "…"} ·{" "}
          <Text onPress={() => { setNameDraft(player); setAskName(true); }} style={{ fontFamily: f.semi, color: c.purple }}>Change</Text>
        </Text>
        <Button label={last ? "See my score" : "Next question"} onPress={next} busy={busy} disabled={picked === undefined} />
        <Text style={{ textAlign: "center", fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 12 }}>No account needed. Just be a good friend.</Text>
      </ScrollView>

      {/* Who's playing? */}
      <Modal visible={askName} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(28,26,23,0.55)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: c.paper, borderRadius: 28, padding: 24 }}>
            <Text style={{ fontFamily: f.display, fontSize: 28, color: c.ink }}>Who’s playing?</Text>
            <Text style={{ fontFamily: f.body, fontSize: 14, color: c.muted, marginVertical: 8 }}>So {owner} knows who to crown.</Text>
            <TextInput
              autoFocus value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" placeholderTextColor={c.faint}
              style={{ fontFamily: f.display, fontSize: 22, color: c.ink, backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 }}
            />
            <Button label="Let’s go" disabled={!nameDraft.trim()} onPress={() => { setPlayer(nameDraft.trim()); setAskName(false); }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Done({ quiz, result, answers, preview, owner, onExit }) {
  const pct = result.score != null ? result.score / result.total : null;
  const line = pct === null ? "Your answers are in!" : pct === 1 ? "Certified bestie." : pct >= 0.6 ? "Okay, you do know them." : "Hmm. Do you two even talk?";
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        <View style={{ backgroundColor: c.purple, borderRadius: 32, padding: 26, marginTop: 10, marginBottom: 20 }}>
          <Text style={{ fontFamily: f.semi, fontSize: 12, letterSpacing: 1.2, color: c.lime }}>{preview ? "PREVIEW RESULT" : `${owner.toUpperCase()}’S VERDICT`}</Text>
          <Text style={{ fontFamily: f.display, fontSize: 64, color: c.white, marginTop: 10 }}>
            {result.score != null ? `${result.score}/${result.total}` : "Sent!"}
          </Text>
          <Text style={{ fontFamily: f.display, fontSize: 24, color: c.white }}>{line}</Text>
        </View>

        {preview &&
          quiz.questions.map((q, k) => {
            const ok = answers[k] === q.correctIndex;
            return (
              <View key={k} style={{ backgroundColor: c.white, borderRadius: 20, borderWidth: 1.5, borderColor: c.line, padding: 16, marginBottom: 10 }}>
                <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.ink }}>{q.text}</Text>
                <Text style={{ fontFamily: f.body, fontSize: 13, color: ok ? "#3C5A00" : c.danger, marginTop: 6 }}>
                  {ok ? "✓ " : "✗ "}You said: {q.options[answers[k]]}
                </Text>
                {!ok && <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 2 }}>Right answer: {q.options[q.correctIndex]}</Text>}
              </View>
            );
          })}

        <Button label={preview ? "Back to my link" : "Done"} onPress={onExit} tone="lime" icon="checkmark" style={{ marginTop: 10 }} />
      </ScrollView>
    </Screen>
  );
}
