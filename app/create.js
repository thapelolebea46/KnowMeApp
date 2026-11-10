import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Share, Text, TextInput, View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { api, getUserName, WEB } from "../src/api";
import { setDraft } from "../src/store";
import { BANK, blankQuestion, CATEGORIES, DEFAULT_TITLE, STARTER, withId } from "../src/presets";
import { c, f, shadow } from "../src/theme";
import { ActionSheet, Button, Eyebrow, Field, H1, IconCircle, Screen, Sheet, Sub } from "../src/ui";

const LETTERS = ["A", "B", "C", "D"];
const pad = (n) => String(n).padStart(2, "0");

export default function Create() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [qs, setQs] = useState(() => STARTER.map(withId));
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(null); // { code }
  const [menu, setMenu] = useState(false);
  const [catMenu, setCatMenu] = useState(false);
  const [picker, setPicker] = useState(false);

  const q = qs[idx];
  const answered = qs.filter((x) => x.correctIndex !== null).length;
  const patch = (changes) => setQs(qs.map((x, k) => (k === idx ? { ...x, ...changes } : x)));
  const setOpt = (j, v) => patch({ options: q.options.map((o, k) => (k === j ? v : o)) });

  function addQuestion(base) {
    if (qs.length >= 20) return setError("20 questions is the max. Your friends have lives.");
    setQs([...qs, withId(base)]);
    setIdx(qs.length);
    setPicker(false);
    setError("");
  }
  function duplicate() {
    if (qs.length >= 20) return;
    const copy = withId({ ...q, correctIndex: q.correctIndex });
    setQs([...qs.slice(0, idx + 1), copy, ...qs.slice(idx + 1)]);
    setIdx(idx + 1);
  }
  function remove() {
    if (qs.length === 1) return setError("A quiz needs at least one question.");
    setQs(qs.filter((_, k) => k !== idx));
    setIdx(Math.max(0, idx - 1));
  }

  // Build the payload the backend already understands (+ category), dropping empty options.
  function build() {
    if (!title.trim()) return { err: "Give your quiz a name.", at: -1 };
    for (let i = 0; i < qs.length; i++) {
      const x = qs[i];
      if (!x.text.trim()) return { err: `Question ${i + 1} needs some text.`, at: i };
      const filled = x.options.map((o, k) => ({ o: o.trim(), k })).filter((z) => z.o);
      if (filled.length < 2) return { err: `Question ${i + 1} needs at least two options.`, at: i };
      if (x.correctIndex === null) return { err: `Tap your answer for question ${i + 1}.`, at: i };
      if (!filled.some((z) => z.k === x.correctIndex)) return { err: `Question ${i + 1}: your correct answer is empty.`, at: i };
    }
    const questions = qs.map((x) => {
      const filled = x.options.map((o, k) => ({ o: o.trim(), k })).filter((z) => z.o);
      return {
        text: x.text.trim(),
        category: x.category,
        options: filled.map((z) => z.o),
        correctIndex: filled.findIndex((z) => z.k === x.correctIndex),
      };
    });
    return { questions };
  }

  async function save() {
    setError("");
    const r = build();
    if (r.err) {
      setError(r.err);
      if (r.at >= 0) setIdx(r.at);
      return;
    }
    setBusy(true);
    try {
      const { code } = await api("/api/quizzes", { method: "POST", body: { title: title.trim(), questions: r.questions } });
      setDraft({ title: title.trim(), ownerName: getUserName(), questions: r.questions });
      setSaved({ code, count: r.questions.length });
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const header = (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6 }}>
      <IconCircle name={step === 2 ? "close" : "chevron-back"} label="Back" onPress={() => (step === 2 ? router.replace("/quizzes") : router.back())} />
    </View>
  );

  if (step === 2 && saved) return <Share2 header={header} title={title} saved={saved} router={router} />;

  return (
    <Screen>
      {header}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Eyebrow>Make it personal</Eyebrow>
          <H1 style={{ marginTop: 6 }}>A little quiz.{"\n"}A lot of you.</H1>

          {/* Stepper */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 10 }}>
            <Dot n={1} active label="Questions" />
            <View style={{ flex: 1, height: 1.5, backgroundColor: c.line }} />
            <Dot n={2} label="Share" />
          </View>

          <Field
            label="Quiz name"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
            right={<Ionicons name="pencil-outline" size={18} color={c.muted} />}
          />

          {/* Question pager */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
            {qs.map((x, k) => {
              const on = k === idx;
              const done = x.correctIndex !== null;
              return (
                <Pressable key={x.id} onPress={() => setIdx(k)} accessibilityLabel={`Go to question ${k + 1}`}
                  style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center",
                    backgroundColor: on ? c.ink : done ? c.lavender : c.fill,
                    borderWidth: !done && !on ? 1.5 : 0, borderStyle: "dashed", borderColor: c.faint }}>
                  <Text style={{ fontFamily: f.semi, fontSize: 13, color: on ? c.white : done ? c.purple : c.muted }}>{k + 1}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Question card */}
          <View style={[{ backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 28, padding: 20, marginTop: 14 }, shadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", gap: 8, flexShrink: 1 }}>
                <View style={{ backgroundColor: c.lavender, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: f.semi, fontSize: 11, letterSpacing: 0.5, color: c.purple }}>
                    QUESTION {pad(idx + 1)} / {pad(qs.length)}
                  </Text>
                </View>
                <Pressable onPress={() => setCatMenu(true)} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.fill, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7 }}>
                  <Text numberOfLines={1} style={{ fontFamily: f.semi, fontSize: 11, color: c.ink }}>{q.category}</Text>
                  <Ionicons name="chevron-down" size={12} color={c.muted} />
                </Pressable>
              </View>
              <Pressable onPress={() => setMenu(true)} hitSlop={12} accessibilityLabel="Question options">
                <Ionicons name="ellipsis-horizontal" size={22} color={c.muted} />
              </Pressable>
            </View>

            <TextInput
              value={q.text}
              onChangeText={(v) => patch({ text: v })}
              placeholder="Ask something only a true friend would know…"
              placeholderTextColor={c.faint}
              multiline
              scrollEnabled={false}
              style={{ fontFamily: f.display, fontSize: 27, lineHeight: 31, color: c.ink, marginTop: 20, marginBottom: 18, padding: 0, letterSpacing: -0.4 }}
            />

            <Text style={{ fontFamily: f.semi, fontSize: 11, letterSpacing: 0.8, color: c.muted, marginBottom: 10 }}>
              OPTIONS · SELECT YOUR CORRECT ANSWER
            </Text>
            <View style={{ gap: 8 }}>
              {q.options.map((o, j) => (
                <OptionRow key={`${q.id}-${j}`} letter={LETTERS[j]} value={o} selected={q.correctIndex === j}
                  onSelect={() => patch({ correctIndex: j })} onChange={(v) => setOpt(j, v)} />
              ))}
            </View>
          </View>

          <Text style={{ fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 14, marginLeft: 2 }}>
            Your answer stays hidden until they finish. Tap an option to mark it as correct, tap it again to edit.
          </Text>

          <Pressable onPress={() => setPicker(true)}
            style={{ borderWidth: 1.5, borderStyle: "dashed", borderColor: c.purple, borderRadius: 20, paddingVertical: 17, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 14, backgroundColor: c.fill }}>
            <Ionicons name="add" size={20} color={c.purple} />
            <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.purple }}>Add a question</Text>
          </Pressable>

          {!!error && (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 16 }}>
              <Ionicons name="alert-circle" size={18} color={c.danger} />
              <Text style={{ flex: 1, fontFamily: f.medium, fontSize: 14, color: c.danger }}>{error}</Text>
            </View>
          )}

          <Button label="Save & get link" onPress={save} busy={busy} style={{ marginTop: 18 }} />
          <Text style={{ textAlign: "center", fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 12 }}>
            {qs.length} questions  ·  {answered}/{qs.length} answers set
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet visible={menu} onClose={() => setMenu(false)} title={`Question ${idx + 1}`} actions={[
        { label: "Change category", icon: "pricetag-outline", onPress: () => setTimeout(() => setCatMenu(true), 300) },
        { label: "Duplicate", icon: "copy-outline", onPress: duplicate },
        { label: "Delete question", icon: "trash-outline", danger: true, onPress: remove },
      ]} />
      <ActionSheet visible={catMenu} onClose={() => setCatMenu(false)} title="Category"
        actions={CATEGORIES.map((cat) => ({ label: cat, icon: cat === q.category ? "radio-button-on" : "radio-button-off", onPress: () => patch({ category: cat }) }))} />
      <Picker visible={picker} onClose={() => setPicker(false)} used={qs} onPick={addQuestion} />
    </Screen>
  );
}

function Dot({ n, label, active }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: active ? c.ink : c.line }}>
        <Text style={{ fontFamily: f.semi, fontSize: 13, color: active ? c.white : c.muted }}>{n}</Text>
      </View>
      <Text style={{ fontFamily: f.semi, fontSize: 14, color: active ? c.ink : c.muted }}>{label}</Text>
    </View>
  );
}

// Tap = mark as the correct answer. Tap again (when selected) = edit the text.
function OptionRow({ letter, value, selected, onSelect, onChange }) {
  const ref = useRef(null);
  return (
    <Pressable
      onPress={() => (selected ? ref.current?.focus() : onSelect())}
      style={{
        flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, minHeight: 52, borderRadius: 16,
        backgroundColor: selected ? c.lavender : c.fill, borderWidth: 1.5, borderColor: selected ? c.purple : "transparent",
      }}
    >
      <Text style={{ fontFamily: f.semi, fontSize: 13, color: selected ? c.purple : c.muted, width: 14 }}>{letter}</Text>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        placeholder={`Option ${letter}`}
        placeholderTextColor={c.faint}
        multiline
        scrollEnabled={false}
        editable={selected}
        style={{ flex: 1, fontFamily: selected ? f.semi : f.medium, fontSize: 15, color: selected ? c.purple : c.ink, paddingVertical: 12, pointerEvents: selected ? "auto" : "none" }}
      />
      {selected && <Ionicons name="checkmark" size={20} color={c.purple} />}
    </Pressable>
  );
}

// "Add a question" sheet: pick a preset by category or write your own.
function Picker({ visible, onClose, used, onPick }) {
  const [cat, setCat] = useState("All");
  const usedTexts = useMemo(() => new Set(used.map((x) => x.text)), [used]);
  const list = BANK.filter((b) => !usedTexts.has(b.text) && (cat === "All" || b.category === cat));
  return (
    <Sheet visible={visible} onClose={onClose} title="Add a question">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }} style={{ flexGrow: 0 }}>
        {["All", ...CATEGORIES].map((k) => (
          <Pressable key={k} onPress={() => setCat(k)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: cat === k ? c.ink : c.fill }}>
            <Text style={{ fontFamily: f.semi, fontSize: 13, color: cat === k ? c.white : c.ink }}>{k}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView style={{ flexGrow: 0 }}>
        <Pressable onPress={() => onPick(blankQuestion(cat === "All" ? "Personality" : cat))}
          style={{ flexDirection: "row", gap: 10, alignItems: "center", padding: 14, borderRadius: 16, backgroundColor: c.purple, marginBottom: 8 }}>
          <Ionicons name="create-outline" size={20} color={c.white} />
          <Text style={{ fontFamily: f.semi, fontSize: 15, color: c.white }}>Write my own</Text>
        </Pressable>
        {list.length === 0 && <Text style={{ fontFamily: f.body, color: c.muted, padding: 10 }}>No more presets here. Write your own!</Text>}
        {list.map((b) => (
          <Pressable key={b.text} onPress={() => onPick(b)} style={{ padding: 14, borderRadius: 16, backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, marginBottom: 8 }}>
            <Text style={{ fontFamily: f.semi, fontSize: 11, letterSpacing: 0.6, color: c.purple, marginBottom: 4 }}>{b.category.toUpperCase()}</Text>
            <Text style={{ fontFamily: f.medium, fontSize: 15, color: c.ink }}>{b.text}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Sheet>
  );
}

// ---- Step 2: share --------------------------------------------------------------
function Share2({ header, title, saved, router }) {
  const [copied, setCopied] = useState(false);
  const name = getUserName();
  const first = name.split(" ")[0] || "me";
  const link = `${WEB}/q/${saved.code}`;
  const pretty = link.replace(/^https?:\/\//, "");
  const message = `Think you know ${first === "me" ? "me" : first}? Take my quiz: ${link}`;
  const minutes = Math.max(1, Math.ceil(saved.count / 4));

  async function copy() {
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  const more = () => Share.share({ message });
  async function sms() {
    const url = `sms:${Platform.OS === "ios" ? "&" : "?"}body=${encodeURIComponent(message)}`;
    try { await Linking.openURL(url); } catch { more(); }
  }

  const tiles = [
    { label: "Message", icon: "chatbubble-outline", onPress: sms },
    { label: "Your story", icon: "image-outline", onPress: more },
    { label: "More", icon: "ellipsis-horizontal", onPress: more },
  ];

  return (
    <Screen>
      {header}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Eyebrow>Good questions. Great friends.</Eyebrow>
        <H1 style={{ marginTop: 6 }}>Ready, set.{"\n"}Send it.</H1>
        <Sub style={{ marginTop: 10 }}>One link. A little friendly competition.</Sub>

        {/* Share card with lime offset shadow */}
        <View style={{ marginTop: 22, marginBottom: 28 }}>
          <View style={{ position: "absolute", left: 8, right: -4, top: 14, bottom: -12, backgroundColor: c.lime, borderRadius: 30 }} />
          <View style={{ backgroundColor: c.purple, borderRadius: 30, padding: 24, minHeight: 215 }}>
            <Text style={{ fontFamily: f.semi, fontSize: 12, letterSpacing: 0.8, color: c.white, opacity: 0.9, textTransform: "uppercase", maxWidth: "65%" }} numberOfLines={1}>{title}</Text>
            <Text style={{ fontFamily: f.display, fontSize: 40, lineHeight: 42, color: c.white, marginTop: 16, letterSpacing: -0.6 }}>
              Think you{"\n"}know {first === "me" ? "me" : first}?
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26 }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}>
                <Text style={{ fontFamily: f.medium, fontSize: 13, color: c.white }}>{saved.count} questions  ·  {minutes} minute{minutes > 1 ? "s" : ""}</Text>
              </View>
              <Text style={{ fontFamily: f.display, fontSize: 18, color: c.white }}>knowme</Text>
            </View>
            <View style={{ position: "absolute", top: 14, right: 14, width: 74, height: 74, borderRadius: 37, backgroundColor: c.lime, alignItems: "center", justifyContent: "center", transform: [{ rotate: "12deg" }] }}>
              <Text style={{ fontFamily: f.display, fontSize: 15, lineHeight: 16, color: c.ink, textAlign: "center" }}>PROVE{"\n"}IT.</Text>
            </View>
          </View>
        </View>

        <Eyebrow style={{ marginBottom: 10 }}>Your personal link</Eyebrow>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 22, padding: 12, paddingLeft: 18 }}>
          <Ionicons name="link" size={22} color={c.purple} />
          <Text numberOfLines={1} selectable style={{ flex: 1, fontFamily: f.medium, fontSize: 16, color: c.ink }}>{pretty}</Text>
          <Pressable onPress={copy} accessibilityLabel="Copy link" style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: c.lavender, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={22} color={c.purple} />
          </Pressable>
        </View>

        <Eyebrow style={{ marginTop: 26, marginBottom: 10 }}>Send it to your circle</Eyebrow>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {tiles.map((t) => (
            <Pressable key={t.label} onPress={t.onPress} style={{ flex: 1, backgroundColor: "#EFEAE0", borderRadius: 20, paddingVertical: 20, alignItems: "center", gap: 10 }}>
              <Ionicons name={t.icon} size={24} color={c.ink} />
              <Text style={{ fontFamily: f.semi, fontSize: 13, color: c.ink }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <Button label={copied ? "Link copied!" : "Copy my link"} icon={copied ? "checkmark" : "copy-outline"} onPress={copy} style={{ marginTop: 22 }} />
        <Pressable onPress={() => router.push("/play/preview")} style={{ alignItems: "center", paddingVertical: 14 }}>
          <Text style={{ fontFamily: f.semi, fontSize: 14, color: c.purple }}>Preview as a friend</Text>
        </Pressable>
        <Text style={{ textAlign: "center", fontFamily: f.body, fontSize: 13, color: c.muted }}>No downloads. Just a little friendly competition.</Text>
      </ScrollView>
    </Screen>
  );
}
