import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { Btn, Screen } from '../components/ui';
import { C } from '../theme';

export default function SignIn() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, [pulse]);

  const login = () => { setLoading(true); setTimeout(() => dispatch({ type: 'SIGNIN' }), 800); }; // giả lập đăng nhập
  const scale = (a: number, b: number) => pulse.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

  return (
    <Screen style={{ paddingHorizontal: 20 }}>
      <View style={s.center}>
        <Animated.View style={[s.ring, { width: 190, height: 190, backgroundColor: '#EEDDFB', transform: [{ scale: scale(1, 1.08) }] }]}>
          <Animated.View style={[s.ring, { width: 140, height: 140, backgroundColor: '#C9A0F2', transform: [{ scale: scale(1, 1.06) }] }]}>
            <View style={[s.ring, { width: 96, height: 96, backgroundColor: C.purple }]}><Ionicons name="heart" size={54} color="#fff" /></View>
          </Animated.View>
        </Animated.View>
        <Text style={s.title}>HeartSync</Text>
        <Text style={s.tag}>Where Hearts Connect, Love Finds Its Sync.</Text>
      </View>
      {loading ? <ActivityIndicator color={C.primary} size="large" style={{ marginBottom: 90 }} /> : (
        <View style={{ gap: 12 }}>
          <Btn kind="dark" label="Continue with Apple" icon="logo-apple" onPress={login} />
          <Btn label="Continue with Facebook" icon="logo-facebook" onPress={login} style={{ backgroundColor: '#3B99E8' }} />
          <Btn label="Use phone number" icon="phone-portrait-outline" onPress={login} />
          <Text style={s.legal}>By signing up you agree to our Terms and Conditions{'\n'}See how we use your data in our Privacy Policy</Text>
        </View>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 36, fontWeight: '800', marginTop: 20, color: C.text },
  tag: { color: C.sub, marginTop: 6, fontSize: 12 },
  legal: { textAlign: 'center', color: C.sub, fontSize: 12, lineHeight: 20, marginVertical: 16 },
});
