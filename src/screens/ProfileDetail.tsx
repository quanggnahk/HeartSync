import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Chip, H, IconBtn, Screen } from '../components/ui';
import ProfileCard from '../components/ProfileCard';
import { RootParams } from '../types';
import { C } from '../theme';

export default function ProfileDetail() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootParams, 'ProfileDetail'>>();
  const { state, dispatch } = useApp();
  const p = PROFILES.find((x) => x.id === params.id)!;
  const isMatch = state.matches.includes(p.id);
  const shared = p.interests.filter((i) => state.me.interests.includes(i));

  const swipe = (dir: 'left' | 'right') => { dispatch({ type: 'SWIPE', id: p.id, dir }); nav.goBack(); };
  const report = () => Alert.alert('Hide and report', `Hide ${p.name} and report this profile?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Hide & report', style: 'destructive', onPress: () => { dispatch({ type: 'BLOCK', id: p.id }); nav.goBack(); } },
  ]);

  return (
    <Screen>
      <View style={s.bar}>
        <IconBtn name="chevron-back" onPress={() => nav.goBack()} />
        <IconBtn name={state.saved.includes(p.id) ? 'bookmark' : 'bookmark-outline'} color={C.primary} onPress={() => dispatch({ type: 'SAVE', id: p.id })} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        <View style={{ height: 430 }}><ProfileCard p={p} /></View>
        <View style={s.loc}><Ionicons name="location" size={14} color={C.red} /><Text style={{ color: C.sub }}> {p.distanceKm}.0 kilometres away</Text>
          <Text style={s.city}>{p.city}</Text></View>
        {shared.length > 0 && <Text style={s.common}>✨ {shared.length} interest{shared.length > 1 ? 's' : ''} in common: {shared.join(', ')}</Text>}
        <H>About me</H><Text style={s.about}>{p.bio}</Text>
        <H>My details</H><View style={s.wrap}>{p.details.map((d) => <Chip key={d} label={d} />)}</View>
        <H>I enjoy</H><View style={s.wrap}>{p.interests.map((d) => <Chip key={d} label={d} tone={shared.includes(d) ? '#C9F3F8' : undefined} />)}</View>
        <H>I communicate in</H><View style={s.wrap}>{p.languages.map((d) => <Chip key={d} label={d} />)}</View>
        <View style={s.actions}>
          {isMatch ? (
            <Pressable style={s.msgBtn} onPress={() => nav.navigate('Chat', { id: p.id })}><Ionicons name="chatbubble" size={18} color="#fff" /><Text style={s.msgT}>  Send a message</Text></Pressable>
          ) : (<>
            <Pressable style={[s.round, { backgroundColor: '#FDE8E8' }]} onPress={() => swipe('left')}><Ionicons name="close" size={30} color={C.red} /></Pressable>
            <Pressable style={[s.round, { backgroundColor: '#E3F7E8' }]} onPress={() => swipe('right')}><Ionicons name="checkmark" size={30} color={C.green} /></Pressable>
          </>)}
        </View>
        <Pressable onPress={report}><Text style={s.report}>Hide and Report Profile</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  loc: { backgroundColor: C.primaryLight, padding: 14, borderRadius: 10, marginTop: 18 },
  city: { fontSize: 22, fontWeight: '600', marginTop: 4, color: C.text },
  common: { marginTop: 12, color: C.primary, fontWeight: '600' },
  about: { color: C.text, lineHeight: 23, fontSize: 15 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 36, marginTop: 30 },
  round: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  msgBtn: { flexDirection: 'row', backgroundColor: C.primary, paddingHorizontal: 28, height: 52, borderRadius: 26, alignItems: 'center' },
  msgT: { color: '#fff', fontWeight: '700', fontSize: 16 },
  report: { textAlign: 'center', fontWeight: '700', marginTop: 40, color: C.text },
});
