import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

export const Screen = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { top } = useSafeAreaInsets();
  return <View style={[{ flex: 1, backgroundColor: C.bg, paddingTop: top }, style]}>{children}</View>;
};

export const Btn = ({ label, onPress, kind = 'primary', style, disabled, icon }: {
  label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'dark' | 'danger'; style?: StyleProp<ViewStyle>; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap;
}) => {
  const bg = { primary: C.primary, ghost: C.card, dark: C.text, danger: C.red }[kind];
  const color = kind === 'ghost' ? C.sub : '#fff';
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [s.btn, { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }, style]}>
      {icon && <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />}
      <Text style={{ color, fontWeight: '700', fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
};

export const Chip = ({ label, active, onPress, tone, style }: { label: string; active?: boolean; onPress?: () => void; tone?: string; style?: StyleProp<TextStyle> }) => (
  <Pressable onPress={onPress} disabled={!onPress}>
    <Text style={[s.chip, active && { backgroundColor: C.primary, color: '#fff' }, tone ? { backgroundColor: tone } : null, style]}>{label}</Text>
  </Pressable>
);

const dot = { online: C.green, away: C.amber, offline: C.gray };
export const Avatar = ({ p, size = 56, status }: { p: { emoji: string; color: string; online?: 'online' | 'away' | 'offline' }; size?: number; status?: boolean }) => (
  <View style={{ width: size, height: size }}>
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: p.color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: size * 0.5 }}>{p.emoji}</Text>
    </View>
    {status && p.online && <View style={[s.dot, { backgroundColor: dot[p.online], width: size * 0.26, height: size * 0.26, borderRadius: size * 0.13 }]} />}
  </View>
);

export const H = ({ children }: { children: string }) => <Text style={s.h}>{children}</Text>;
export const IconBtn = ({ name, onPress, color = C.text, size = 24 }: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; color?: string; size?: number }) => (
  <Pressable onPress={onPress} hitSlop={12} style={{ padding: 6 }}><Ionicons name={name} size={size} color={color} /></Pressable>
);

const s = StyleSheet.create({
  btn: { height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  chip: { backgroundColor: C.card, color: C.text, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, fontSize: 13, overflow: 'hidden', marginRight: 8, marginBottom: 8 },
  dot: { position: 'absolute', right: 0, bottom: 0, borderWidth: 2, borderColor: '#fff' },
  h: { fontSize: 22, fontWeight: '800', color: C.text, marginTop: 22, marginBottom: 10 },
});
