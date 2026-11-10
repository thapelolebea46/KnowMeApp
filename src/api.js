import * as SecureStore from "expo-secure-store";

export const API = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
export const WEB = process.env.EXPO_PUBLIC_WEB_URL || "http://localhost:5173";

let token = null;

export async function loadToken() {
  token = await SecureStore.getItemAsync("token");
  return token;
}

export async function setToken(t) {
  token = t;
  if (t) await SecureStore.setItemAsync("token", t);
  else await SecureStore.deleteItemAsync("token");
}

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
