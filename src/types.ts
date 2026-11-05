export type Gender = 'Male' | 'Female' | 'Nonbinary';
export type Dir = 'left' | 'right';
export interface Profile {
  id: string; name: string; age: number; gender: Gender; pronouns: string; job: string; verified: boolean;
  distanceKm: number; city: string; bio: string; color: string; emoji: string;
  details: string[]; interests: string[]; languages: string[]; likesYou: boolean; online: 'online' | 'away' | 'offline';
}
export interface Message { id: string; from: 'me' | 'them'; text: string; ts: number }
export interface Filters { genders: Gender[]; ageMin: number; ageMax: number; maxDistance: number; languages: string[]; expandWhenEmpty: boolean }
export interface Me {
  name: string; age: number; gender: Gender; pronouns: string; emoji: string; color: string; verified: boolean;
  about: string; occupation: string; education: string; location: string; height: string;
  smoking: string; drinking: string; pets: string; children: string; zodiac: string; religion: string;
  interests: string[]; languages: string[];
}
export interface AppState {
  hydrated: boolean; signedIn: boolean; tutorialSeen: boolean; skipConfirm: boolean; premium: boolean;
  me: Me; filters: Filters;
  passed: string[]; liked: string[]; blocked: string[]; saved: string[]; matches: string[];
  chats: Record<string, Message[]>; lastSwiped: { id: string; dir: Dir } | null; newMatchId: string | null;
}
export type Action =
  | { type: 'HYDRATE'; state: Partial<AppState> } | { type: 'SIGNIN' } | { type: 'SIGNOUT' }
  | { type: 'TUTORIAL_DONE' } | { type: 'SKIP_CONFIRM' } | { type: 'SWIPE'; id: string; dir: Dir } | { type: 'UNDO' }
  | { type: 'CLEAR_MATCH' } | { type: 'SAVE'; id: string } | { type: 'SEND'; id: string; msg: Message }
  | { type: 'FILTERS'; filters: Filters } | { type: 'UPDATE_ME'; patch: Partial<Me> } | { type: 'PREMIUM' }
  | { type: 'BLOCK'; id: string } | { type: 'UNBLOCK_ALL' } | { type: 'RESET_SWIPES' } | { type: 'RESET_ALL' };
export type RootParams = {
  SignIn: undefined; Tabs: undefined; ProfileDetail: { id: string }; Filters: undefined;
  MatchFound: { id: string }; Chat: { id: string }; MiniGame: { id: string }; VideoCall: { id: string }; EditProfile: undefined;
};
