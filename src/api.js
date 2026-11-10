import * as SecureStore from "expo-secure-store";

export const API =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000" ||
  "https://backend-for-know-me.onrender.com";
export const WEB = process.env.EXPO_PUBLIC_WEB_URL || "http://localhost:5173";

let token = null;
let userName = "";

export async function loadToken() {
  token = await SecureStore.getItemAsync("token");
  userName = (await SecureStore.getItemAsync("name")) || "";
  return token;
}

export async function setToken(t) {
  token = t;
  if (t) await SecureStore.setItemAsync("token", t);
  else {
    await SecureStore.deleteItemAsync("token");
    await setUserName("");
  }
}

export const getUserName = () => userName;

export async function setUserName(n) {
  userName = n || "";
  if (userName) await SecureStore.setItemAsync("name", userName);
  else await SecureStore.deleteItemAsync("name");
}

// ---- Friend-facing endpoints --------------------------------------------------
// NOTE: these two paths are assumptions. Point them at whatever your backend exposes
// for the public quiz page (the web app at WEB/q/:code already uses something like it).
export const fetchPublicQuiz = (code) => api(`/api/quizzes/public/${code}`);
export const submitAttempt = (code, body) =>
  api(`/api/quizzes/public/${code}/attempts`, { method: "POST", body });

export async function api(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}
