import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, loadToken, setToken, setUserName } from "../src/api";
import { c, f } from "../src/theme";
import { Button, Eyebrow, Field, H1, Screen, Sub } from "../src/ui";

export default function Auth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const login = mode === "login";

  useEffect(() => {
    loadToken().then((t) => (t ? router.replace("/home") : setReady(true)));
  }, []);

  async function submit() {
    setError("");
    if (!email.trim() || !password) return setError("Add your email and password first.");
    if (!login && !name.trim()) return setError("What should your friends call you?");
    setBusy(true);
    try {
      const d = await api(`/api/auth/${mode}`, {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), password },
      });
      await setToken(d.token);
      // Use whatever name the server returns, otherwise the one typed at sign-up
      await setUserName(d.user?.name || d.name || name.trim() || email.split("@")[0]);
      router.replace("/home");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready)
    return (
      <Screen style={{ justifyContent: "center" }}>
        <ActivityIndicator color={c.purple} />
      </Screen>
    );

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontFamily: f.display, fontSize: 22, color: c.purple, marginBottom: 18 }}>knowme</Text>

          {/* Hero card */}
          <View style={{ backgroundColor: c.purple, borderRadius: 32, padding: 24, overflow: "hidden", marginBottom: 26 }}>
            <Text style={{ position: "absolute", right: -6, top: -26, fontFamily: f.display, fontSize: 240, color: "rgba(255,255,255,0.14)" }}>?</Text>
            <Eyebrow color={c.lime}>Good questions. Great friends.</Eyebrow>
            <Text style={{ fontFamily: f.display, fontSize: 32, lineHeight: 34, color: c.white, marginTop: 12, letterSpacing: -0.5 }}>
              How well do your friends know the real you?
            </Text>
            <View style={{ alignSelf: "flex-start", backgroundColor: c.lime, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, marginTop: 18, transform: [{ rotate: "-4deg" }] }}>
              <Text style={{ fontFamily: f.display, fontSize: 13, color: c.ink }}>PROVE IT.</Text>
            </View>
          </View>

          <Eyebrow>{login ? "Welcome back" : "Make it personal"}</Eyebrow>
          <H1 style={{ marginTop: 6 }}>{login ? "Log in.\nGet quizzed." : "Join in.\nMake your quiz."}</H1>
          <Sub style={{ marginTop: 8, marginBottom: 20 }}>
            {login ? "Pick up where you left off." : "Takes less than a minute. Your friends never need an account."}
          </Sub>

          {/* Segmented toggle */}
          <View style={{ flexDirection: "row", backgroundColor: c.fill, borderRadius: 18, padding: 4, marginBottom: 16 }}>
            {[["login", "Log in"], ["register", "Sign up"]].map(([m, label]) => (
              <Pressable
                key={m}
                onPress={() => { setMode(m); setError(""); }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: mode === m ? c.ink : "transparent" }}
              >
                <Text style={{ fontFamily: f.semi, fontSize: 14, color: mode === m ? c.white : c.muted }}>{label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ gap: 12 }}>
            {!login && <Field label="Your name" placeholder="Alex" value={name} onChangeText={setName} autoCapitalize="words" />}
            <Field label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
            <Field
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              autoCapitalize="none"
              onSubmitEditing={submit}
              right={
                <Pressable onPress={() => setShowPw(!showPw)} hitSlop={10} accessibilityLabel="Show or hide password">
                  <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={22} color={c.muted} />
                </Pressable>
              }
            />
          </View>

          {!!error && (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 14 }}>
              <Ionicons name="alert-circle" size={18} color={c.danger} />
              <Text style={{ flex: 1, fontFamily: f.medium, fontSize: 14, color: c.danger }}>{error}</Text>
            </View>
          )}

          <Button label={login ? "Log in" : "Create account"} onPress={submit} busy={busy} style={{ marginTop: 20 }} />

          <Text style={{ textAlign: "center", fontFamily: f.body, fontSize: 13, color: c.muted, marginTop: 14 }}>
            No downloads for your friends. Just a little friendly competition.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
