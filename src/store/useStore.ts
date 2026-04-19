import { create } from 'zustand';

interface User {
  id: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  stealthMode: boolean;
  autoLockMinutes: number;
  isDisguised: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setStealthMode: (stealthMode: boolean) => void;
  setAutoLockMinutes: (minutes: number) => void;
  toggleDisguise: () => void;
}

export const useStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  stealthMode: localStorage.getItem('stealthMode') === 'true',
  autoLockMinutes: parseInt(localStorage.getItem('autoLockMinutes') || '5', 10),
  isDisguised: localStorage.getItem('isDisguised') === 'true',

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null });
  },

  setStealthMode: (stealthMode) => {
    localStorage.setItem('stealthMode', stealthMode.toString());
    set({ stealthMode });
  },

  setAutoLockMinutes: (autoLockMinutes) => {
    localStorage.setItem('autoLockMinutes', autoLockMinutes.toString());
    set({ autoLockMinutes });
  },
  
  toggleDisguise: () => {
    const current = get().isDisguised;
    const newState = !current;
    localStorage.setItem('isDisguised', newState.toString());
    
    // Auto-lock when entering disguise
    if (newState) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ isDisguised: newState, token: null, user: null });
    } else {
      set({ isDisguised: newState });
    }
  }
}));
