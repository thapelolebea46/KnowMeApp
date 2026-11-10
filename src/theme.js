import { StyleSheet } from "react-native";

export const c = { paper: "#f2efff", ink: "#1a1240", pink: "#ff4f87", sun: "#ffd23f" };

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper, padding: 20 },
  h1: { fontSize: 34, fontWeight: "800", color: c.ink, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: "700", color: c.ink },
  muted: { color: c.ink, opacity: 0.65 },
  input: { borderWidth: 2.5, borderColor: c.ink, borderRadius: 14, backgroundColor: "#fff",
    padding: 14, fontSize: 16, color: c.ink, marginBottom: 12 },
  btn: { backgroundColor: c.sun, borderWidth: 2.5, borderColor: c.ink, borderRadius: 14,
    padding: 15, alignItems: "center", marginTop: 4 },
  btnText: { fontWeight: "800", fontSize: 16, color: c.ink },
  card: { backgroundColor: "#fff", borderWidth: 2.5, borderColor: c.ink, borderRadius: 14,
    padding: 14, marginBottom: 12 },
  error: { color: "#c0153f", marginBottom: 10, fontWeight: "600" },
});
