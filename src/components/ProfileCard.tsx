import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../types';
import { C } from '../theme';

export default function ProfileCard({ p }: { p: Profile }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: p.color, borderRadius: 22, overflow: 'hidden' }]}>
      <Text style={s.emoji}>{p.emoji}</Text>
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={s.fade} />
      <View style={s.info}>
        <Text style={s.name}>{p.name}, {p.age} {p.verified && <Ionicons name="shield-checkmark" size={20} color="#1E90FF" />}</Text>
        <Text style={s.pron}>{p.pronouns}</Text>
        <Text style={s.job}><Ionicons name="briefcase-outline" size={14} color="#fff" /> {p.job}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  emoji: { fontSize: 150, textAlign: 'center', marginTop: '28%' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  info: { position: 'absolute', left: 20, bottom: 22 },
  name: { color: '#fff', fontSize: 28, fontWeight: '800' },
  pron: { alignSelf: 'flex-start', backgroundColor: C.primaryLight, color: C.primary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, overflow: 'hidden', marginVertical: 6, fontSize: 12 },
  job: { color: '#fff', fontSize: 14 },
});
