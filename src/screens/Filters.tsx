import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Btn, Chip } from '../components/ui';
import { Filters as F, Gender } from '../types';
import options from '../data/options.json';
import { C } from '../theme';

const GENDERS: Gender[] = ['Male', 'Female', 'Nonbinary'];
const EMPTY: F = { genders: [], ageMin: 18, ageMax: 80, maxDistance: 80, languages: [], expandWhenEmpty: true };
const tog = <T,>(a: T[], v: T) => (a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);

export default function Filters() {
  const nav = useNav();
  const { state, dispatch } = useApp();
  const [f, setF] = useState<F>(state.filters);
  const tint = { minimumTrackTintColor: C.primary, maximumTrackTintColor: '#A5EEF8', thumbTintColor: C.primary };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={s.head}><Ionicons name="close" size={26} onPress={() => nav.goBack()} /><Text style={s.title}>Filters</Text><View style={{ width: 26 }} /></View>
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        <Text style={s.label}>What is your preferred gender?</Text>
        <View style={s.box}>{GENDERS.map((g) => (
          <View key={g} style={s.row}><Text>{g}</Text>
            <Ionicons name={f.genders.includes(g) ? 'checkbox' : 'square-outline'} size={26} color={f.genders.includes(g) ? C.primary : '#4B5563'} onPress={() => setF({ ...f, genders: tog(f.genders, g) })} />
          </View>))}</View>

        <Text style={s.label}>Age range: {f.ageMin} – {f.ageMax}</Text>
        <View style={s.box}>
          <Slider {...tint} minimumValue={18} maximumValue={80} step={1} value={f.ageMin} onValueChange={(v) => setF((p) => ({ ...p, ageMin: Math.min(v, p.ageMax) }))} />
          <Slider {...tint} minimumValue={18} maximumValue={80} step={1} value={f.ageMax} onValueChange={(v) => setF((p) => ({ ...p, ageMax: Math.max(v, p.ageMin) }))} />
        </View>

        <Text style={s.label}>Distance: up to {f.maxDistance} km</Text>
        <View style={s.box}>
          <Slider {...tint} minimumValue={1} maximumValue={80} step={1} value={f.maxDistance} onValueChange={(v) => setF((p) => ({ ...p, maxDistance: v }))} />
          <View style={[s.row, { marginTop: 8 }]}><Text style={{ flex: 1, paddingRight: 12 }}>Show profiles within a 15-km range when run out of matches.</Text>
            <Switch value={f.expandWhenEmpty} trackColor={{ true: C.primary }} onValueChange={(v) => setF({ ...f, expandWhenEmpty: v })} /></View>
        </View>

        <Text style={s.label}>Languages:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {options.languages.map((l) => <Chip key={l} label={l} active={f.languages.includes(l)} onPress={() => setF({ ...f, languages: tog(f.languages, l) })} />)}
        </View>
      </ScrollView>
      <View style={s.foot}>
        <Btn kind="ghost" label="Clear all" style={{ flex: 1 }} onPress={() => setF(EMPTY)} />
        <Btn label="Apply filters" style={{ flex: 1.4 }} onPress={() => { dispatch({ type: 'FILTERS', filters: f }); nav.goBack(); }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, paddingTop: 22, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 18, fontWeight: '800' },
  label: { color: C.primary, marginTop: 20, marginBottom: 8, fontSize: 13 },
  box: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  foot: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 30, borderTopWidth: 1, borderColor: '#eee' },
});
