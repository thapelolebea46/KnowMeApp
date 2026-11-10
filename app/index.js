import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { api, loadToken, setToken } from "../src/api";
import { s, c } from "../src/theme";

export default function Auth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadToken().then((t) => (t ? router.replace("/home") : setReady(true)));
  }, []);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const d = await api(`/api/auth/${mode}`, { method: "POST", body: { name, email, password } });
      await setToken(d.token);
      router.replace("/home");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <View style={[s.screen, { justifyContent: "center" }]}><ActivityIndicator color={c.ink} /></View>;

  return (
    <View style={[s.screen, { justifyContent: "center" }]}>
      <Text style={s.h1}>{mode === "login" ? "Welcome back" : "Make your quiz"}</Text>
      <Text style={[s.muted, { marginBottom: 20 }]}>Find out which friends really know you.</Text>
      {mode === "register" && <TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName} />}
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {!!error && <Text style={s.error}>{error}</Text>}
      <TouchableOpacity style={s.btn} onPress={submit} disabled={busy}>
        <Text style={s.btnText}>{mode === "login" ? "Log in" : "Create account"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMode(mode === "login" ? "register" : "login")} style={{ padding: 14, alignItems: "center" }}>
        <Text style={{ color: c.ink, textDecorationLine: "underline" }}>
          {mode === "login" ? "New here? Create an account" : "Have an account? Log in"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
