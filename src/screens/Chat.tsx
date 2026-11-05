import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PROFILES, useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Avatar, Chip, IconBtn, Screen } from '../components/ui';
import { msg, pick } from '../utils/helpers';
import options from '../data/options.json';
import { RootParams } from '../types';
import { C } from '../theme';

function Typing() {
  const v = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const l = Animated.loop(Animated.stagger(180, v.map((x) => Animated.sequence([
      Animated.timing(x, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(x, { toValue: 0.3, duration: 300, useNativeDriver: true })]))));
    l.start(); return () => l.stop();
  }, [v]);
  return <View style={[s.bub, s.them, { flexDirection: 'row', gap: 4 }]}>{v.map((x, i) => <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.sub, opacity: x }} />)}</View>;
}

export default function Chat() {
  const nav = useNav();
  const { params } = useRoute<RouteProp<RootParams, 'Chat'>>();
  const { state, dispatch } = useApp();
  const p = PROFILES.find((x) => x.id === params.id)!;
  const list = state.chats[p.id] ?? [];
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const ref = useRef<FlatList>(null);

  useEffect(() => { setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 50); }, [list.length, typing]);

  const send = (t: string) => {
    if (!t.trim()) return;
    dispatch({ type: 'SEND', id: p.id, msg: msg('me', t.trim()) });
    setText(''); setTyping(true);
    // Giả lập đối phương đang gõ rồi trả lời
    setTimeout(() => { setTyping(false); dispatch({ type: 'SEND', id: p.id, msg: msg('them', pick(options.replies)) }); }, 1400 + Math.random() * 1400);
  };
  const more = () => Alert.alert(p.name, undefined, [
    { text: 'View profile', onPress: () => nav.navigate('ProfileDetail', { id: p.id }) },
    { text: 'Unmatch & report', style: 'destructive', onPress: () => { dispatch({ type: 'BLOCK', id: p.id }); nav.goBack(); } },
    { text: 'Cancel', style: 'cancel' },
  ]);

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.top}>
          <IconBtn name="arrow-back" onPress={() => nav.goBack()} />
          <View style={{ flexDirection: 'row' }}><IconBtn name="videocam" onPress={() => nav.navigate('VideoCall', { id: p.id })} /><IconBtn name="ellipsis-vertical" onPress={more} /></View>
        </View>
        <Pressable style={s.who} onPress={() => nav.navigate('ProfileDetail', { id: p.id })}>
          <Avatar p={p} size={64} status />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={s.name}>{p.name}, {p.age} {p.verified && <Ionicons name="shield-checkmark" size={16} color="#1E90FF" />}</Text>
            <Text style={s.job}>{p.job}</Text>
          </View>
          <Ionicons name="chevron-forward-circle" size={34} color={C.primary} />
        </Pressable>
        <FlatList ref={ref} data={list} keyExtractor={(m) => m.id} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={s.empty}>You matched with {p.name.split(' ')[0]}. Break the ice!</Text>}
          ListFooterComponent={typing ? <Typing /> : undefined}
          renderItem={({ item }) => (
            <View style={[s.bub, item.from === 'me' ? s.me : s.them]}>
              <Text style={{ color: item.from === 'me' ? '#fff' : C.text }}>{item.text}</Text>
              <Text style={[s.time, item.from === 'me' && { color: '#D8F6FA' }]}>{new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>)} />
        {list.length < 2 && (
          <View style={{ paddingHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{options.icebreakers.slice(0, 2).map((t) => <Chip key={t} label={t} tone={C.primaryLight} style={{ color: C.primary }} onPress={() => send(t)} />)}</View>
          </View>
        )}
        <Pressable style={s.game} onPress={() => nav.navigate('MiniGame', { id: p.id })}>
          <Text style={{ color: C.primary, fontWeight: '700' }}><Ionicons name="bulb-outline" size={15} /> Invite your match to play a mini-game.</Text>
          <Text style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>Break the ice and find out if you both sync on a deeper level.</Text>
        </Pressable>
        <View style={s.input}>
          <TextInput value={text} onChangeText={setText} placeholder="Type a message..." style={{ flex: 1 }} onSubmitEditing={() => send(text)} returnKeyType="send" />
          <Pressable onPress={() => send(text)}><Ionicons name="send" size={22} color={text.trim() ? C.primary : C.gray} /></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  who: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  name: { fontSize: 20, fontWeight: '800' }, job: { color: C.sub, marginTop: 4 },
  bub: { maxWidth: '78%', padding: 12, borderRadius: 14, marginBottom: 8 },
  me: { alignSelf: 'flex-end', backgroundColor: C.primary, borderBottomRightRadius: 4 },
  them: { alignSelf: 'flex-start', backgroundColor: C.card, borderBottomLeftRadius: 4 },
  time: { fontSize: 10, color: C.sub, marginTop: 4, alignSelf: 'flex-end' },
  empty: { textAlign: 'center', color: C.sub, marginTop: 40 },
  game: { backgroundColor: '#E9FCFF', margin: 16, marginBottom: 8, padding: 14, borderRadius: 6, borderWidth: 1, borderColor: '#CFF3F9' },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 24, margin: 16, marginTop: 4, paddingHorizontal: 16, height: 46 },
});
