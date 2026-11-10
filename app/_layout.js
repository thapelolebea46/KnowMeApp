import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { c } from "../src/theme";

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.paper },
          headerTintColor: c.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.paper },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: "My quizzes", headerBackVisible: false }} />
        <Stack.Screen name="create" options={{ title: "New quiz" }} />
        <Stack.Screen name="quiz/[id]" options={{ title: "Results" }} />
      </Stack>
    </>
  );
}
