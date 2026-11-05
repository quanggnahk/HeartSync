import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { RootParams } from '../types';
import { C } from '../theme';
import SignIn from '../screens/SignIn';
import Discover from '../screens/Discover';
import ProfileDetail from '../screens/ProfileDetail';
import Filters from '../screens/Filters';
import MatchFound from '../screens/MatchFound';
import Inbox from '../screens/Inbox';
import Chat from '../screens/Chat';
import MiniGame from '../screens/MiniGame';
import VideoCall from '../screens/VideoCall';
import MyProfile from '../screens/MyProfile';
import EditProfile from '../screens/EditProfile';
import Saved from '../screens/Saved';

export const useNav = () => useNavigation<NativeStackNavigationProp<RootParams>>();
const navRef = createNavigationContainerRef<RootParams>();
const Stack = createNativeStackNavigator<RootParams>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const { state } = useApp();
  const fresh = state.matches.filter((id) => !(state.chats[id]?.length)).length;
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = { Profile: 'person-outline', Discover: 'heart-outline', Saved: 'bookmark-outline', Inbox: 'paper-plane-outline' };
  return (
    <Tab.Navigator initialRouteName="Discover" screenOptions={({ route }) => ({
      headerShown: false, tabBarShowLabel: false, tabBarActiveTintColor: C.primary, tabBarInactiveTintColor: '#4B5563',
      tabBarIcon: ({ color }) => <Ionicons name={icons[route.name]} size={26} color={color} />,
    })}>
      <Tab.Screen name="Profile" component={MyProfile} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Saved" component={Saved} />
      <Tab.Screen name="Inbox" component={Inbox} options={{ tabBarBadge: fresh > 0 ? fresh : undefined }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { state, dispatch } = useApp();

  // Khi có match mới (từ bất kỳ màn hình nào) -> mở màn hình "Match found!"
  useEffect(() => {
    if (state.newMatchId && navRef.isReady()) {
      navRef.navigate('MatchFound', { id: state.newMatchId });
      dispatch({ type: 'CLEAR_MATCH' });
    }
  }, [state.newMatchId, dispatch]);

  if (!state.hydrated) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={C.primary} /></View>;

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.signedIn ? (
          <Stack.Screen name="SignIn" component={SignIn} />
        ) : (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="ProfileDetail" component={ProfileDetail} />
            <Stack.Screen name="Filters" component={Filters} options={{ presentation: 'modal' }} />
            <Stack.Screen name="MatchFound" component={MatchFound} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="MiniGame" component={MiniGame} options={{ presentation: 'modal' }} />
            <Stack.Screen name="VideoCall" component={VideoCall} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
