import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Btn } from '../components/ui';
import { hash, msg } from '../utils/helpers';
import options from '../data/options.json';
import { RootParams } from '../types';
import { C } from '../theme';

// "Would you rather" — đáp án của đối phương được sinh ổn định từ hash(id + câu hỏi)
export default function MiniGame() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootParams, 'MiniGame'>>();
  const { dispatch } = useApp();
  const p = PROFILES.find((x) => x.id === params.id)!;
  const [i, setI] = useState(0);
  const [same, setSame] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const done = i >= options.quiz.length;
  const score = Math.round((same / options.quiz.length) * 100);

  useEffect(() => { fade.setValue(0); Animated.spring(fade, { toValue: 1, useNativeDriver: true }).start(); }, [i, fade]);

  const answer = (k: 0 | 1) => { if (hash(p.id + i) % 2 === k) setSame((x) => x + 1); setI(i + 1); };
  const share = () => { dispatch({ type: 'SEND', id: p.id, msg: msg('me', `🎮 We're ${score}% in sync! Want to compare answers?`) }); nav.goBack(); };

  return (
    <View style={s.wrap}>
      <Text style={s.h}>Sync game with {p.name.split(' ')[0]}</Text>
      <View style={s.bar}><View style={[s.fill, { width: `${(Math.min(i, 5) / 5) * 100}%` }]} /></View>
      {!done ? (
        <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
          <Text style={s.q}>{options.quiz[i].q}</Text>
          <Btn label={options.quiz[i].a} onPress={() => answer(0)} style={{ marginBottom: 12 }} />
          <Btn kind="dark" label={options.quiz[i].b} onPress={() => answer(1)} />
        </Animated.View>
      ) : (
        <Animated.View style={{ alignItems: 'center', opacity: fade, transform: [{ scale: fade }] }}>
          <View style={s.ring}><Text style={s.pct}>{score}%</Text></View>
          <Text style={s.res}>{score >= 80 ? 'Perfectly in sync!' : score >= 40 ? 'Nice chemistry — keep talking.' : 'Opposites attract, right?'}</Text>
          <Btn label="Send result to chat" onPress={share} style={{ alignSelf: 'stretch', marginTop: 24 }} />
          <Btn kind="ghost" label="Play again" onPress={() => { setI(0); setSame(0); }} style={{ alignSelf: 'stretch', marginTop: 10 }} />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 36, justifyContent: 'center' },
  h: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  bar: { height: 6, backgroundColor: '#A5EEF8', borderRadius: 3, marginVertical: 24, overflow: 'hidden' }, fill: { height: 6, backgroundColor: C.primary },
  q: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 28 },
  ring: { width: 150, height: 150, borderRadius: 75, borderWidth: 10, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  pct: { fontSize: 40, fontWeight: '900', color: C.primary }, res: { fontSize: 16, marginTop: 18, color: C.text },
});
