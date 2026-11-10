import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { c, f } from "../../src/theme";

const icon = (name, nameActive) => ({ color, focused }) => (
  <Ionicons name={focused ? nameActive : name} size={24} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.purple,
        tabBarInactiveTintColor: c.muted,
        tabBarActiveBackgroundColor: c.lavender,
        tabBarLabelStyle: { fontFamily: f.semi, fontSize: 12 },
        tabBarItemStyle: { borderRadius: 22, marginVertical: 8, marginHorizontal: 6 },
        tabBarStyle: { backgroundColor: c.paper, borderTopColor: c.line, height: 84, paddingBottom: 6 },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="quizzes" options={{ title: "My quizzes", tabBarIcon: icon("grid-outline", "grid") }} />
      <Tabs.Screen name="results" options={{ title: "Results", tabBarIcon: icon("stats-chart-outline", "stats-chart") }} />
    </Tabs>
  );
}
