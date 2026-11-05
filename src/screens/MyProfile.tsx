import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar, Btn, IconBtn, Screen } from '../components/ui';
import { completion } from '../utils/helpers';
import { C, shadow } from '../theme';

const ROWS: [string, boolean][] = [['Unlimited swipes', true], ['Advanced filters', true], ['Remove ads', false], ['Undo accidental left swipes', false], ['Push your profile to more viewers', false]];

export default function MyProfile() {
  const nav = useNav();
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<'Plans' | 'Safety'>('Plans');
  const [paying, setPaying] = useState(false);
  const pct = completion(state.me);
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(w, { toValue: pct, duration: 700, useNativeDriver: false }).start(); }, [pct, w]);

  const upgrade = () => Alert.alert('HeartSync Premium', '$7.99 / month (demo — no real payment).', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Subscribe', onPress: () => { setPaying(true); setTimeout(() => { setPaying(false); dispatch({ type: 'PREMIUM' }); }, 1200); } },
  ]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <View style={s.top}>
          <Avatar p={state.me} size={110} />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={s.name}>{state.me.name}, {state.me.age} {state.premium && <Ionicons name="star" size={16} color={C.amber} />}</Text>
            <Pressable style={s.edit} onPress={() => nav.navigate('EditProfile')}><Text style={{ color: C.primary }}>Edit your profile ›</Text></Pressable>
          </View>
        </View>
        <View style={s.track}><Animated.View style={[s.fill, { width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} /></View>
        <Text style={{ color: C.sub, marginTop: 6 }}>{pct}% complete</Text>

        <Pressable style={s.verify} onPress={() => dispatch({ type: 'UPDATE_ME', patch: { verified: true } })}>
          <Ionicons name={state.me.verified ? 'shield-checkmark' : 'shield-outline'} size={28} color="#2F80ED" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.sub }}>Verification adds an extra layer of authenticity and trust to your profile.</Text>
            <Text style={{ color: '#2F80ED', fontWeight: '700', marginTop: 4 }}>{state.me.verified ? 'Account verified' : 'Verify your account now!'}</Text>
          </View>
        </Pressable>

        <View style={s.tabs}>{(['Plans', 'Safety'] as const).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, tab === t && { borderBottomColor: C.primary }]}><Text style={[s.tabT, tab === t && { color: C.primary }]}>{t}</Text></Pressable>))}</View>

        {tab === 'Plans' ? (<>
          <View style={s.promo}>
            <Text style={s.pH}>HeartSync Premium</Text>
            <Text style={s.pS}>Unlock exclusive features and supercharge your dating experience.</Text>
            {paying ? <ActivityIndicator color="#fff" style={{ marginTop: 12 }} /> :
              <Pressable style={s.upg} onPress={state.premium ? undefined : upgrade}><Text style={{ fontWeight: '700' }}>{state.premium ? 'You are Premium ✓' : 'Upgrade from $7.99'}</Text></Pressable>}
          </View>
          <View style={s.table}>
            <View style={s.tr}><Text style={[s.td, { fontWeight: '700' }]}>What's included</Text><Text style={s.c}>Free</Text><Text style={[s.c, { color: C.primary }]}>Premium</Text></View>
            {ROWS.map(([label, free]) => (
              <View key={label} style={s.tr}><Text style={s.td}>{label}</Text>
                <Ionicons name={free ? 'checkbox' : 'square-outline'} size={22} color={free ? C.primary : C.gray} style={s.c} />
                <Ionicons name="checkbox" size={22} color={C.primary} style={s.c} /></View>))}
          </View>
        </>) : (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Text style={{ color: C.sub }}>Hidden or reported profiles: {state.blocked.length}</Text>
            <Btn kind="ghost" label="Unhide all profiles" onPress={() => dispatch({ type: 'UNBLOCK_ALL' })} />
            <Btn kind="ghost" label="Reset demo data" icon="refresh" onPress={() => Alert.alert('Reset demo data?', 'This restores matches, chats and swipes.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: () => dispatch({ type: 'RESET_ALL' }) }])} />
            <Btn kind="danger" label="Sign out" onPress={() => dispatch({ type: 'SIGNOUT' })} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' }, name: { fontSize: 22, fontWeight: '800' },
  edit: { alignSelf: 'flex-start', backgroundColor: C.primaryLight, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginTop: 8 },
  track: { height: 8, backgroundColor: '#A5EEF8', borderRadius: 4, marginTop: 18, overflow: 'hidden' }, fill: { height: 8, backgroundColor: C.primary },
  verify: { flexDirection: 'row', backgroundColor: '#F6F7F9', padding: 16, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  tabs: { flexDirection: 'row', justifyContent: 'center', marginTop: 22, borderBottomWidth: 1, borderColor: '#eee' },
  tab: { paddingHorizontal: 28, paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent' }, tabT: { fontSize: 16, color: C.sub, fontWeight: '600' },
  promo: { backgroundColor: C.primary, borderRadius: 6, padding: 22, alignItems: 'center', marginTop: 18 },
  pH: { color: '#fff', fontSize: 22, fontWeight: '800' }, pS: { color: '#fff', textAlign: 'center', marginTop: 8 },
  upg: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18, marginTop: 14 },
  table: { borderWidth: 1, borderColor: '#eee', borderRadius: 6, marginTop: 16, paddingHorizontal: 14 },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderColor: '#f2f2f2' },
  td: { flex: 1 }, c: { width: 70, textAlign: 'center' },
});
