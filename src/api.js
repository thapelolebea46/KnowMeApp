import * as SecureStore from "expo-secure-store";

export const API = "https://quiz-backend-21jc.onrender.com";
export const WEB = "https://quiz-web-yg8l.onrender.com";

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
