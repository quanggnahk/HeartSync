import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import Confetti from '../components/Confetti';
import { Avatar, IconBtn, Screen } from '../components/ui';
import { msg } from '../utils/helpers';
import options from '../data/options.json';
import { RootParams } from '../types';
import { C } from '../theme';

export default function MatchFound() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootParams, 'MatchFound'>>();
  const { state, dispatch } = useApp();
  const p = PROFILES.find((x) => x.id === params.id)!;
  const a = useRef(new Animated.Value(0)).current, heart = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(a, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(heart, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [a, heart]);

  const startWith = (t: string) => { dispatch({ type: 'SEND', id: p.id, msg: msg('me', t) }); nav.replace('Chat', { id: p.id }); };

  return (
    <Screen>
      <Confetti />
      <View style={s.bar}><IconBtn name="close" onPress={() => nav.goBack()} /></View>
      <View style={s.body}>
        <Animated.Text style={[s.title, { opacity: a, transform: [{ scale: a }] }]}>Match found!</Animated.Text>
        <View style={s.photos}>
          <Animated.View style={[s.ph, { backgroundColor: p.color, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-120, 0] }) }, { rotate: '-4deg' }] }]}><Text style={s.emo}>{p.emoji}</Text></Animated.View>
          <Animated.View style={[s.ph, { backgroundColor: state.me.color, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) }, { rotate: '3deg' }] }]}><Text style={s.emo}>{state.me.emoji}</Text></Animated.View>
          <Animated.View style={[s.heart, { transform: [{ scale: heart }] }]}><Ionicons name="heart" size={34} color="#fff" /></Animated.View>
        </View>
        <Text style={s.txt}>You and {p.name.split(' ')[0]} have both shown interest in each other! Now go send that first message. Don't wait too long!</Text>
        <Text style={s.hint}>Stuck on what to say? Tap a conversation starter:</Text>
        {options.icebreakers.slice(0, 3).map((t) => (
          <Pressable key={t} style={s.starter} onPress={() => startWith(t)}><Ionicons name="bulb-outline" size={16} color={C.primary} /><Text style={s.stT}>  {t}</Text></Pressable>
        ))}
        <Pressable onPress={() => nav.replace('Chat', { id: p.id })}><Text style={s.link}>Write my own message</Text></Pressable>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  bar: { paddingHorizontal: 10 }, body: { flex: 1, alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 38, fontWeight: '900', color: C.primary, marginTop: 20 },
  photos: { flexDirection: 'row', marginVertical: 32, alignItems: 'center' },
  ph: { width: 150, height: 190, margin: -6, borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#fff', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  emo: { fontSize: 70 },
  heart: { position: 'absolute', alignSelf: 'center', left: '50%', marginLeft: -30, width: 60, height: 60, borderRadius: 30, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#D9B8F7' },
  txt: { textAlign: 'center', color: C.text, lineHeight: 22, fontSize: 15 },
  hint: { color: C.sub, marginTop: 28, marginBottom: 10, fontSize: 13 },
  starter: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.primaryLight, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 8, alignSelf: 'stretch' },
  stT: { color: C.primary, flex: 1 }, link: { color: C.sub, textDecorationLine: 'underline', marginTop: 12 },
});
