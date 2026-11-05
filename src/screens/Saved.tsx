import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar, Screen } from '../components/ui';
import { C } from '../theme';

export default function Saved() {
  const nav = useNav();
  const { state, dispatch } = useApp();
  const items = state.saved.map((id) => PROFILES.find((p) => p.id === id)).filter(Boolean) as typeof PROFILES;
  return (
    <Screen>
      <Text style={s.h}>Saved profiles</Text>
      <FlatList data={items} keyExtractor={(p) => p.id}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="bookmark-outline" size={52} color={C.gray} /><Text style={s.es}>Tap the bookmark on a profile to keep it for later.</Text></View>}
        renderItem={({ item: p }) => (
          <Pressable style={s.row} onPress={() => nav.navigate('ProfileDetail', { id: p.id })}>
            <Avatar p={p} size={56} />
            <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ fontWeight: '700', fontSize: 16 }}>{p.name}, {p.age}</Text><Text style={{ color: C.sub }}>{p.job} · {p.distanceKm} km</Text></View>
            <Ionicons name="bookmark" size={22} color={C.primary} onPress={() => dispatch({ type: 'SAVE', id: p.id })} />
          </Pressable>)} />
    </Screen>
  );
}
const s = StyleSheet.create({
  h: { fontSize: 24, fontWeight: '800', margin: 18 }, row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 }, es: { color: C.sub, textAlign: 'center', marginTop: 12 },
});
