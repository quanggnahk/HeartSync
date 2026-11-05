import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useNav } from '../navigation';
import { Btn, IconBtn, Screen } from '../components/ui';
import ProfileCard from '../components/ProfileCard';
import { getDeck } from '../utils/helpers';
import { Dir } from '../types';
import { C, shadow } from '../theme';

const W = Math.min(Dimensions.get("window").width, 430);
const TH = W * 0.28;

export default function Discover() {
  const nav = useNav();
  const { state, dispatch } = useApp();
  const queue = useMemo(() => getDeck(state), [state.filters, state.passed, state.liked, state.blocked, state.matches, state.profilesVersion]);
  const top = queue[0], next = queue[1];
  const total = queue.length + state.passed.length + state.liked.length;
  const progress = total ? (state.passed.length + state.liked.length) / total : 0;

  const pos = useRef(new Animated.ValueXY()).current;
  const [confirm, setConfirm] = useState(false);
  const [dontAsk, setDontAsk] = useState(false);

  const fly = (dir: Dir) => {
    if (!top) return;
    Animated.timing(pos, { toValue: { x: dir === 'right' ? W * 1.5 : -W * 1.5, y: 0 }, duration: 240, useNativeDriver: false }).start(() => {
      dispatch({ type: 'SWIPE', id: top.id, dir });
      pos.setValue({ x: 0, y: 0 });
    });
  };
  const reset = () => Animated.spring(pos, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
  const decide = (dir: Dir) => {
    if (dir === 'right' && !state.skipConfirm) { setConfirm(true); Animated.spring(pos, { toValue: { x: TH, y: 0 }, useNativeDriver: false }).start(); }
    else fly(dir);
  };

  // PanResponder tạo 1 lần -> dùng ref để luôn gọi bản handler mới nhất (tránh stale closure)
  const h = useRef({ decide, reset, open: () => {} });
  h.current = { decide, reset, open: () => top && nav.navigate('ProfileDetail', { id: top.id }) };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) return h.current.open(); // chạm = xem hồ sơ
      if (g.dx > TH || g.vx > 1.2) h.current.decide('right');
      else if (g.dx < -TH || g.vx < -1.2) h.current.decide('left');
      else h.current.reset();
    },
  })).current;

  const rotate = pos.x.interpolate({ inputRange: [-W, 0, W], outputRange: ['-14deg', '0deg', '14deg'] });
  const likeOp = pos.x.interpolate({ inputRange: [0, TH], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOp = pos.x.interpolate({ inputRange: [-TH, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const nextScale = pos.x.interpolate({ inputRange: [-TH, 0, TH], outputRange: [1, 0.93, 1], extrapolate: 'clamp' });

  const undo = () => {
    if (!state.premium) return Alert.alert('Premium feature', 'Upgrade to undo accidental left swipes.', [{ text: 'Not now' }, { text: 'See plans', onPress: () => nav.navigate('Tabs') }]);
    if (state.lastSwiped?.dir === 'left') dispatch({ type: 'UNDO' });
    else Alert.alert('Nothing to undo', 'Only your last left swipe can be undone.');
  };

  return (
    <Screen>
      <View style={s.header}>
        <IconBtn name="refresh-outline" onPress={undo} />
        <Text style={s.title}>HeartSync</Text>
        <Pressable onPress={() => nav.navigate('Filters')} style={s.filterBtn}><Ionicons name="options-outline" size={22} color={C.primary} /></Pressable>
      </View>
      <View style={s.track}><View style={[s.fill, { width: `${progress * 100}%` }]} /></View>

      <View style={s.deck}>
        {!top ? (
          <View style={s.empty}>
            <Ionicons name="heart-dislike-outline" size={56} color={C.gray} />
            <Text style={s.emptyT}>You're all caught up</Text>
            <Text style={s.emptyS}>Widen your filters or bring back profiles you passed on.</Text>
            <Btn label="Adjust filters" onPress={() => nav.navigate('Filters')} style={{ marginTop: 16 }} />
            <Btn kind="ghost" label="Show passed profiles again" onPress={() => dispatch({ type: 'RESET_SWIPES' })} style={{ marginTop: 10 }} />
          </View>
        ) : (
          <>
            {next && <Animated.View style={[s.card, { transform: [{ scale: nextScale }] }]}><ProfileCard p={next} /></Animated.View>}
            <Animated.View {...pan.panHandlers} style={[s.card, shadow, { transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }]}>
              <ProfileCard p={top} />
              <Animated.Text style={[s.stamp, s.like, { opacity: likeOp }]}>LIKE</Animated.Text>
              <Animated.Text style={[s.stamp, s.nope, { opacity: nopeOp }]}>PASS</Animated.Text>
            </Animated.View>
          </>
        )}
        {top && !state.tutorialSeen && (
          <Pressable style={s.tut} onPress={() => dispatch({ type: 'TUTORIAL_DONE' })}>
            <Text style={s.tutH}>Swipe right if you like</Text>
            <Text style={s.tutS}>If the person also swipes right on you, it's a match and you can connect.</Text>
            <View style={s.line} />
            <Text style={s.tutH}>Swipe left to pass</Text>
            <Text style={s.tutS}>If the person is not your cup of tea, simply pass. It's that easy!</Text>
            <Text style={[s.tutS, { marginTop: 24 }]}>Tap to start</Text>
          </Pressable>
        )}
      </View>

      {top && (
        <View style={s.actions}>
          <Pressable style={[s.round, { backgroundColor: '#FDE8E8' }]} onPress={() => decide('left')}><Ionicons name="close" size={30} color={C.red} /></Pressable>
          <Pressable style={[s.round, { backgroundColor: C.primaryLight, width: 48, height: 48 }]} onPress={() => dispatch({ type: 'SAVE', id: top.id })}>
            <Ionicons name={state.saved.includes(top.id) ? 'bookmark' : 'bookmark-outline'} size={22} color={C.primary} />
          </Pressable>
          <Pressable style={[s.round, { backgroundColor: '#E3F7E8' }]} onPress={() => decide('right')}><Ionicons name="checkmark" size={30} color={C.green} /></Pressable>
        </View>
      )}
      {!state.premium && <Text style={s.ad}>Sponsored · Upgrade to Premium to remove ads</Text>}

      <Modal transparent visible={confirm} animationType="fade">
        <View style={s.overlay}>
          <View style={s.dialog}>
            <View style={s.dIcon}><Ionicons name="arrow-redo-outline" size={26} color={C.primary} /></View>
            <Text style={s.dH}>You've just swiped right!</Text>
            <Text style={s.dS}>By swiping right, you're expressing interest in this person. If they also swipe right on your profile, it's a match! Do you want to continue?</Text>
            <Pressable onPress={() => setDontAsk(!dontAsk)} style={s.check}>
              <Ionicons name={dontAsk ? 'checkbox' : 'square-outline'} size={20} color={C.primary} /><Text style={{ marginLeft: 8, color: C.sub }}>Don't ask me again</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Btn kind="ghost" label="Cancel" style={{ flex: 1 }} onPress={() => { setConfirm(false); reset(); }} />
              <Btn label="Continue" style={{ flex: 1 }} onPress={() => { setConfirm(false); if (dontAsk) dispatch({ type: 'SKIP_CONFIRM' }); fly('right'); }} />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const FILL = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  title: { fontSize: 18, fontWeight: '800', color: C.text },
  filterBtn: { backgroundColor: C.primaryLight, padding: 9, borderRadius: 12 },
  track: { alignSelf: 'center', width: '70%', height: 4, backgroundColor: '#A5EEF8', borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, backgroundColor: C.primary },
  deck: { flex: 1, margin: 18 },
  card: { ...FILL, borderRadius: 22 },
  stamp: { position: 'absolute', top: 40, fontSize: 34, fontWeight: '900', borderWidth: 4, borderRadius: 10, paddingHorizontal: 12 },
  like: { left: 24, color: C.green, borderColor: C.green, transform: [{ rotate: '-14deg' }] },
  nope: { right: 24, color: C.red, borderColor: C.red, transform: [{ rotate: '14deg' }] },
  tut: { ...FILL, backgroundColor: 'rgba(0,150,170,0.82)', borderRadius: 22, padding: 28, justifyContent: 'center' },
  tutH: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tutS: { color: '#fff', marginTop: 4 },
  line: { height: 1, backgroundColor: '#fff', marginVertical: 28 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, paddingBottom: 10 },
  round: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ad: { textAlign: 'center', fontSize: 11, color: C.sub, paddingVertical: 6, backgroundColor: C.card },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyT: { fontSize: 20, fontWeight: '800', marginTop: 12 }, emptyS: { color: C.sub, textAlign: 'center', marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: 22, alignItems: 'center' },
  dIcon: { backgroundColor: C.primaryLight, padding: 14, borderRadius: 30 },
  dH: { fontSize: 18, fontWeight: '800', marginTop: 12 }, dS: { color: C.sub, textAlign: 'center', marginVertical: 12, lineHeight: 20 },
  check: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
});
