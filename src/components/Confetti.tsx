import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width, height: H } = Dimensions.get("window");
const W = Math.min(width, 430);
const COLORS = ['#7C1FE5', '#00BCD4', '#F5A524', '#FF5C8A', '#FFE066'];

export default function Confetti({ count = 32 }: { count?: number }) {
  const items = useRef(Array.from({ length: count }, () => ({
    x: Math.random() * W, dur: 2200 + Math.random() * 2000, delay: Math.random() * 800,
    c: COLORS[Math.floor(Math.random() * COLORS.length)], size: 6 + Math.random() * 8, v: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    const loops = items.map((i) => Animated.loop(Animated.timing(i.v, { toValue: 1, duration: i.dur, delay: i.delay, easing: Easing.linear, useNativeDriver: true })));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [items]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((i, k) => (
        <Animated.View key={k} style={{
          position: 'absolute', left: i.x, top: -24, width: i.size, height: i.size * 1.6, backgroundColor: i.c, borderRadius: 2,
          transform: [{ translateY: i.v.interpolate({ inputRange: [0, 1], outputRange: [0, H + 40] }) }, { rotate: i.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] }) }],
        }} />
      ))}
    </View>
  );
}
