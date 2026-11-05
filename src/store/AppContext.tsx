import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../data/db.json';
import profiles from '../data/profiles.json';
import { api } from '../api/client'; // [SERVER] 1. import tầng gọi API
import { Action, AppState, Filters, Me, Message, Profile } from '../types';

// [SERVER] 2. Mảng có thể cập nhật tại chỗ: ban đầu là dữ liệu JSON đóng gói sẵn,
// khi tải được từ server thì được thay thế bằng dữ liệu server
export const PROFILES: Profile[] = [...(profiles as Profile[])];
const KEY = 'heartsync-state-v1';

const initial = (): AppState => {
  const chats: Record<string, Message[]> = {};
  Object.entries(db.seed.chats).forEach(([id, list]) => {
    chats[id] = list.map((m, i) => ({ id: `seed-${id}-${i}`, from: m.from as 'me' | 'them', text: m.text, ts: Date.now() - m.minsAgo * 60000 }));
  });
  return {
    hydrated: false, signedIn: false, tutorialSeen: false, skipConfirm: false, premium: false,
    me: db.me as Me, filters: db.filters as Filters,
    passed: [], liked: [], blocked: [], saved: [], matches: db.seed.matches, chats, lastSwiped: null, newMatchId: null,
    profilesVersion: 0, // [SERVER] 3. tăng lên mỗi lần tải xong hồ sơ để giao diện tính lại
  };
};

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'HYDRATE': return { ...s, ...a.state, hydrated: true, newMatchId: null };
    case 'SIGNIN': return { ...s, signedIn: true };
    case 'SIGNOUT': return { ...s, signedIn: false };
    case 'TUTORIAL_DONE': return { ...s, tutorialSeen: true };
    case 'SKIP_CONFIRM': return { ...s, skipConfirm: true };
    case 'SWIPE': {
      const p = PROFILES.find((x) => x.id === a.id);
      if (!p) return s;
      const base = { ...s, lastSwiped: { id: a.id, dir: a.dir } };
      if (a.dir === 'left') return { ...base, passed: [...s.passed, a.id] };
      return { ...base, liked: [...s.liked, a.id], matches: p.likesYou ? [a.id, ...s.matches] : s.matches, newMatchId: p.likesYou ? a.id : null };
    }
    case 'UNDO': {
      if (!s.lastSwiped || s.lastSwiped.dir !== 'left') return s; // chỉ hoàn tác vuốt trái
      return { ...s, passed: s.passed.filter((x) => x !== s.lastSwiped!.id), lastSwiped: null };
    }
    case 'CLEAR_MATCH': return { ...s, newMatchId: null };
    case 'SAVE': return { ...s, saved: s.saved.includes(a.id) ? s.saved.filter((x) => x !== a.id) : [a.id, ...s.saved] };
    case 'SEND': return { ...s, chats: { ...s.chats, [a.id]: [...(s.chats[a.id] ?? []), a.msg] } };
    case 'FILTERS': return { ...s, filters: a.filters };
    case 'UPDATE_ME': return { ...s, me: { ...s.me, ...a.patch } };
    case 'PREMIUM': return { ...s, premium: true };
    case 'BLOCK': return { ...s, blocked: [...s.blocked, a.id], matches: s.matches.filter((x) => x !== a.id), saved: s.saved.filter((x) => x !== a.id) };
    case 'UNBLOCK_ALL': return { ...s, blocked: [] };
    case 'RESET_SWIPES': return { ...s, passed: [], liked: [], lastSwiped: null };
    case 'RESET_ALL': return { ...initial(), hydrated: true, signedIn: true, tutorialSeen: true };
    case 'PROFILES_LOADED': return { ...s, profilesVersion: s.profilesVersion + 1 }; // [SERVER] 4. action mới
  }
}

const Ctx = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => dispatch({ type: 'HYDRATE', state: raw ? JSON.parse(raw) : {} }))
      .catch(() => dispatch({ type: 'HYDRATE', state: {} }));
  }, []);

  // [SERVER] 5a. Tải hồ sơ từ server lúc mở app; lỗi mạng thì giữ dữ liệu JSON đóng gói sẵn
  useEffect(() => {
    api.profiles()
      .then((list) => {
        if (Array.isArray(list) && list.length) {
          PROFILES.splice(0, PROFILES.length, ...list);
          dispatch({ type: 'PROFILES_LOADED' });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    // [SERVER] 5b. Không lưu profilesVersion vào AsyncStorage
    const { hydrated, newMatchId, profilesVersion, ...persist } = state;
    AsyncStorage.setItem(KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
};