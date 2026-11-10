import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { c, f } from "./theme";

export function Screen({ children, style }) {
  return (
    <SafeAreaView edges={["top"]} style={[{ flex: 1, backgroundColor: c.paper }, style]}>
      {children}
    </SafeAreaView>
  );
}

export const Eyebrow = ({ children, color, style }) => (
  <Text style={[st.eyebrow, color && { color }, style]}>{children}</Text>
);

export const H1 = ({ children, style }) => <Text style={[st.h1, style]}>{children}</Text>;
export const Sub = ({ children, style }) => <Text style={[st.sub, style]}>{children}</Text>;

// Label on the left, icon on the right — same as "Create a quiz  +" in the mockups.
export function Button({ label, onPress, icon = "arrow-forward", tone = "purple", busy, disabled, style }) {
  const lime = tone === "lime";
  const fg = lime ? c.ink : c.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy || disabled}
      style={({ pressed }) => [
        st.btn,
        { backgroundColor: lime ? c.lime : c.purple },
        (pressed || busy) && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[st.btnText, { color: fg }]}>{busy ? "One sec…" : label}</Text>
      {busy ? <ActivityIndicator color={fg} /> : icon ? <Ionicons name={icon} size={24} color={fg} /> : null}
    </Pressable>
  );
}

export function Pill({ children, tone = "lavender", style, textStyle }) {
  const map = {
    lavender: [c.lavender, c.purple],
    lime: [c.lime, c.ink],
    fill: [c.fill, c.ink],
    green: ["#E6EBCB", "#2F3A12"],
  };
  const [bg, fg] = map[tone];
  return (
    <View style={[st.pill, { backgroundColor: bg }, style]}>
      <Text style={[st.pillText, { color: fg }, textStyle]}>{children}</Text>
    </View>
  );
}

export function Field({ label, right, style, inputStyle, ...props }) {
  return (
    <View style={[st.field, style]}>
      <View style={{ flex: 1 }}>
        <Text style={st.fieldLabel}>{label}</Text>
        <TextInput
          placeholderTextColor={c.faint}
          style={[st.fieldInput, inputStyle]}
          {...props}
        />
      </View>
      {right}
    </View>
  );
}

export function IconCircle({ name, onPress, label }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} style={st.circle}>
      <Ionicons name={name} size={20} color={c.ink} />
    </Pressable>
  );
}

// Bottom sheet used for menus and the question picker.
export function Sheet({ visible, onClose, children, title }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={st.backdrop} onPress={onClose} />
      <View style={st.sheet}>
        <View style={st.grabber} />
        {!!title && <Text style={st.sheetTitle}>{title}</Text>}
        {children}
      </View>
    </Modal>
  );
}

export function ActionSheet({ visible, onClose, title, actions }) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          style={st.action}
          onPress={() => {
            onClose();
            a.onPress();
          }}
        >
          <Ionicons name={a.icon} size={20} color={a.danger ? c.danger : c.ink} />
          <Text style={[st.actionText, a.danger && { color: c.danger }]}>{a.label}</Text>
        </Pressable>
      ))}
    </Sheet>
  );
}

export function Empty({ title, text }) {
  return (
    <View style={st.empty}>
      <View style={st.emptyIcon}>
        <Text style={{ fontFamily: f.display, fontSize: 28, color: c.purple }}>?</Text>
      </View>
      <Text style={st.emptyTitle}>{title}</Text>
      <Text style={[st.sub, { textAlign: "center" }]}>{text}</Text>
    </View>
  );
}

export const st = StyleSheet.create({
  eyebrow: { fontFamily: f.semi, fontSize: 12, letterSpacing: 1.3, textTransform: "uppercase", color: c.muted },
  h1: { fontFamily: f.display, fontSize: 38, lineHeight: 40, color: c.ink, letterSpacing: -0.8 },
  sub: { fontFamily: f.body, fontSize: 15, lineHeight: 21, color: c.muted },
  btn: {
    height: 60, borderRadius: 20, paddingHorizontal: 22, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  btnText: { fontFamily: f.semi, fontSize: 17 },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontFamily: f.semi, fontSize: 12 },
  field: {
    backgroundColor: c.white, borderWidth: 1.5, borderColor: c.line, borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 12, flexDirection: "row", alignItems: "center",
  },
  fieldLabel: { fontFamily: f.semi, fontSize: 11, letterSpacing: 1, color: c.muted, textTransform: "uppercase" },
  fieldInput: { fontFamily: f.display, fontSize: 20, color: c.ink, paddingVertical: 4, paddingHorizontal: 0 },
  circle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: c.fill,
    alignItems: "center", justifyContent: "center",
  },
  backdrop: { flex: 1, backgroundColor: "rgba(28,26,23,0.45)" },
  sheet: {
    backgroundColor: c.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 34, maxHeight: "82%",
  },
  grabber: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: c.line, marginBottom: 14 },
  sheetTitle: { fontFamily: f.display, fontSize: 24, color: c.ink, marginBottom: 10 },
  action: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderTopWidth: 1, borderTopColor: c.line },
  actionText: { fontFamily: f.medium, fontSize: 16, color: c.ink },
  empty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: c.lavender, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: f.display, fontSize: 22, color: c.ink },
});
