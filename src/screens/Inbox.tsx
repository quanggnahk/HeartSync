import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar, Screen } from '../components/ui';
import { ago } from '../utils/helpers';
import { C } from '../theme';

export default function Inbox() {
  const nav = useNav();
  const { state } = useApp();
  const [q, setQ] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const mine = state.matches.map((id) => PROFILES.find((p) => p.id === id)!).filter((p) => p && p.name.toLowerCase().includes(q.toLowerCase()));
  const chats = mine.filter((p) => state.chats[p.id]?.length)
    .map((p) => ({ p, last: state.chats[p.id][state.chats[p.id].length - 1] }))
    .filter((c) => !unreadOnly || c.last.from === 'them')
    .sort((a, b) => b.last.ts - a.last.ts);

  return (
    <Screen>
      <View style={s.search}><Ionicons name="search" size={18} color={C.sub} /><TextInput value={q} onChangeText={setQ} placeholder="Search" style={{ flex: 1, marginLeft: 8 }} /></View>
      <Text style={s.h}>Matches ({mine.length})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }} style={{ flexGrow: 0 }}>
        {mine.map((p) => (
          <Pressable key={p.id} style={s.m} onPress={() => nav.navigate(state.chats[p.id]?.length ? 'Chat' : 'ProfileDetail', { id: p.id })}>
            <Avatar p={p} size={92} status />
            {!state.chats[p.id]?.length && <View style={s.new}><Text style={s.newT}>NEW</Text></View>}
            <Text style={s.mn} numberOfLines={1}>{p.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={s.chatH}>
        <Text style={[s.h, { margin: 0 }]}>Chats ({chats.length})</Text>
        <Ionicons name="filter" size={22} color={unreadOnly ? C.primary : C.text} onPress={() => setUnreadOnly(!unreadOnly)} />
      </View>
      <FlatList data={chats} keyExtractor={(c) => c.p.id} ListEmptyComponent={<Text style={s.empty}>{unreadOnly ? 'No replies waiting.' : 'Open a match and say hi!'}</Text>}
        renderItem={({ item: { p, last } }) => (
          <Pressable style={[s.row, last.from === 'them' && { backgroundColor: '#E9FCFF' }]} onPress={() => nav.navigate('Chat', { id: p.id })}>
            <Avatar p={p} size={52} status />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontWeight: '700' }}>{p.name} <Text style={s.t}>{ago(last.ts)}</Text></Text>
              <Text style={{ color: C.sub, marginTop: 3 }} numberOfLines={1}>{last.from === 'me' ? 'You: ' : ''}{last.text}</Text>
            </View>
          </Pressable>
        )} />
    </Screen>
  );
}

const s = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, margin: 16, borderRadius: 8, paddingHorizontal: 12, height: 42 },
  h: { fontSize: 20, fontWeight: '800', marginLeft: 16, marginBottom: 12 },
  m: { alignItems: 'center', marginRight: 12, width: 92 }, mn: { fontSize: 12, color: C.sub, marginTop: 6 },
  new: { position: 'absolute', top: 0, backgroundColor: C.purple, borderRadius: 8, paddingHorizontal: 6 }, newT: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chatH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 18, paddingTop: 12, borderTopWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 }, t: { color: C.sub, fontWeight: '400', fontSize: 12 },
  empty: { textAlign: 'center', color: C.sub, marginTop: 30 },
});
