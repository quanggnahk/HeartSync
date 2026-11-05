import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar, Chip, H, IconBtn, Screen } from '../components/ui';
import { completion } from '../utils/helpers';
import options from '../data/options.json';
import { Me } from '../types';
import { C } from '../theme';

const TEXT: [keyof Me, string][] = [['occupation', 'Occupation'], ['education', 'Education'], ['location', 'Location'], ['height', 'Height (cm)']];
const PICK = ['smoking', 'drinking', 'pets', 'children', 'zodiac', 'religion'] as const;
const tog = (a: string[], v: string) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);

export default function EditProfile() {
  const nav = useNav();
  const { state, dispatch } = useApp();
  const me = state.me;
  const set = (patch: Partial<Me>) => dispatch({ type: 'UPDATE_ME', patch });
  const pct = completion(me);
  const w = useRef(new Animated.Value(pct)).current;
  useEffect(() => { Animated.timing(w, { toValue: pct, duration: 400, useNativeDriver: false }).start(); }, [pct, w]);

  return (
    <Screen>
      <View style={s.bar}><IconBtn name="chevron-back" onPress={() => nav.goBack()} /><Text style={s.t}>Edit profile</Text><View style={{ width: 36 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontWeight: '700' }}>Profile completion: <Text style={{ color: C.primary }}>{pct}%</Text></Text>
        <View style={s.track}><Animated.View style={[s.fill, { width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} /></View>
        <H>Photos</H>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Avatar p={me} size={110} />
          {[1, 2, 3].map((i) => <View key={i} style={s.add}><Text style={{ color: C.sub, fontSize: 28 }}>+</Text></View>)}
        </View>
        <H>About me</H>
        <TextInput multiline value={me.about} onChangeText={(about) => set({ about })} placeholder="Share a few words about yourself, your interests, and what you're looking for..." style={s.about} />
        <H>My details</H>
        {TEXT.map(([k, label]) => (
          <View key={k} style={s.field}><Text style={s.fl}>{label}</Text><TextInput value={String(me[k])} onChangeText={(v) => set({ [k]: v } as Partial<Me>)} placeholder="Add" style={s.fi} /></View>))}
        <Text style={s.hint}>Most people also want to know</Text>
        {PICK.map((k) => (
          <View key={k} style={{ marginBottom: 6 }}><Text style={[s.fl, { marginBottom: 6, textTransform: 'capitalize' }]}>{k}</Text>
            <View style={s.wrap}>{options[k].map((o) => <Chip key={o} label={o} active={me[k] === o} onPress={() => set({ [k]: me[k] === o ? '' : o } as Partial<Me>)} />)}</View></View>))}
        <H>I enjoy</H><Text style={s.hint}>Add at least 3 interests to find like-minded people.</Text>
        <View style={s.wrap}>{options.interests.map((o) => <Chip key={o} label={o} active={me.interests.includes(o)} onPress={() => set({ interests: tog(me.interests, o) })} />)}</View>
        <H>I communicate in</H>
        <View style={s.wrap}>{options.languages.map((o) => <Chip key={o} label={o} active={me.languages.includes(o)} onPress={() => set({ languages: tog(me.languages, o) })} />)}</View>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8 }, t: { fontSize: 17 },
  track: { height: 8, backgroundColor: '#A5EEF8', borderRadius: 4, marginTop: 10, overflow: 'hidden' }, fill: { height: 8, backgroundColor: C.primary },
  add: { flex: 1, height: 110, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.gray, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  about: { backgroundColor: C.card, borderRadius: 8, padding: 12, minHeight: 90, textAlignVertical: 'top' },
  field: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f2f2f2' },
  fl: { color: C.text, fontWeight: '600' }, fi: { textAlign: 'right', color: C.primary, minWidth: 140 },
  hint: { color: C.sub, fontSize: 12, marginVertical: 10 }, wrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
