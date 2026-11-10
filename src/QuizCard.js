import { useEffect, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { api, WEB } from "./api";
import { c, f, shadow } from "./theme";
import { Pill } from "./ui";

export const quizLink = (q) => `${WEB}/q/${q.code}`;

// Card from the "Your quizzes" mockup: icon, title, Live pill, and the current bestie.
export default function QuizCard({ quiz, onPress, actions = false }) {
  const [top, setTop] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!quiz.attempts) return setTop(null);
    api(`/api/quizzes/${quiz.id}/results`)
      .then((d) => setTop(d.leaderboard?.[0] || null))
      .catch(() => {});
  }, [quiz.id, quiz.attempts]);

  const share = () => Share.share({ message: `Think you know me? Take my quiz: ${quizLink(quiz)}` });
  async function copy() {
    await Clipboard.setStringAsync(quizLink(quiz));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 26, padding: 18,
      marginBottom: 14, opacity: pressed ? 0.9 : 1,
    }, shadow]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: c.lavender, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: f.display, fontSize: 28, color: c.purple }}>?</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: f.display, fontSize: 19, color: c.ink }}>{quiz.title}</Text>
          <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 3 }}>
            {quiz.questionCount} questions  ·  {quiz.attempts} friend{quiz.attempts === 1 ? "" : "s"} played
          </Text>
        </View>
        <Pill tone="green"><Text>●  Live</Text></Pill>
      </View>

      <View style={{ height: 1.5, backgroundColor: c.line, marginVertical: 16 }} />

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ fontFamily: f.semi, fontSize: 11, letterSpacing: 0.6, color: c.muted }}>CURRENT BESTIE</Text>
          <Text numberOfLines={1} style={{ fontFamily: f.semi, fontSize: 16, color: c.ink, marginTop: 4 }}>
            {top ? `${top.name} knows you best` : quiz.attempts ? "Loading…" : "Nobody yet. Send your link!"}
          </Text>
        </View>
        {top && (
          <View style={{ backgroundColor: c.lime, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: f.display, fontSize: 22, color: c.ink }}>{top.score}/{top.total}</Text>
          </View>
        )}
      </View>

      {actions && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <Pressable onPress={copy} style={btn}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color={c.purple} />
            <Text style={btnText}>{copied ? "Copied" : "Copy link"}</Text>
          </Pressable>
          <Pressable onPress={share} style={btn}>
            <Ionicons name="share-outline" size={18} color={c.purple} />
            <Text style={btnText}>Share</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const btn = { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 16, backgroundColor: c.lavender };
const btnText = { fontFamily: f.semi, fontSize: 14, color: c.purple };
