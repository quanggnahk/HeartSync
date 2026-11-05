import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar } from '../components/ui';
import { RootParams } from '../types';

export default function VideoCall() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootParams, 'VideoCall'>>();
  const { state } = useApp();
  const p = PROFILES.find((x) => x.id === params.id)!;
  const [connected, setConnected] = useState(false);
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [front, setFront] = useState(true);
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const l = Animated.loop(Animated.timing(ring, { toValue: 1, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    l.start(); const t = setTimeout(() => setConnected(true), 3500);
    return () => { l.stop(); clearTimeout(t); };
  }, [ring]);
  useEffect(() => { if (!connected) return; const i = setInterval(() => setSec((x) => x + 1), 1000); return () => clearInterval(i); }, [connected]);
  const mmss = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  return (
    <View style={[s.bg, { backgroundColor: connected ? p.color : '#6F6B3A' }]}>
      {!connected && <Text style={s.selfBig}>{front ? state.me.emoji : '🌄'}</Text>}
      {connected && <Text style={s.remote}>{p.emoji}</Text>}
      <Pressable style={s.close} onPress={() => nav.goBack()}><Ionicons name="chevron-down" size={28} color="#fff" /></Pressable>
      <View style={s.center}>
        {!connected && <Animated.View style={[s.pulse, { opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }] }]} />}
        {!connected && <Avatar p={p} size={130} />}
        <Text style={s.name}>{p.name}</Text>
        <Text style={s.sub}>{connected ? mmss : 'Calling..'}</Text>
      </View>
      {connected && <View style={s.pip}><Text style={{ fontSize: 40 }}>{state.me.emoji}</Text></View>}
      <View style={s.ctrl}>
        <Pressable style={s.btn} onPress={() => setFront(!front)}><Ionicons name="camera-reverse-outline" size={26} /></Pressable>
        <Pressable style={s.btn} onPress={() => setMuted(!muted)}><Ionicons name={muted ? 'mic-off' : 'mic'} size={26} /></Pressable>
        <Pressable style={[s.btn, { backgroundColor: '#E5383B' }]} onPress={() => nav.goBack()}><Ionicons name="call" size={26} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} /></Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center' },
  selfBig: { position: 'absolute', top: '15%', fontSize: 260, opacity: 0.35 }, remote: { position: 'absolute', top: '22%', fontSize: 240 },
  close: { position: 'absolute', top: 56, left: 16 },
  center: { marginTop: 160, alignItems: 'center' }, pulse: { position: 'absolute', top: 0, width: 130, height: 130, borderRadius: 65, backgroundColor: '#fff' },
  name: { color: '#fff', fontSize: 26, fontWeight: '800', marginTop: 14, textShadowColor: '#0006', textShadowRadius: 6 }, sub: { color: '#fff', marginTop: 6 },
  pip: { position: 'absolute', top: 100, right: 16, width: 90, height: 120, borderRadius: 12, backgroundColor: '#fff8', alignItems: 'center', justifyContent: 'center' },
  ctrl: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 14, backgroundColor: '#0008', padding: 12, borderRadius: 36 },
  btn: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
