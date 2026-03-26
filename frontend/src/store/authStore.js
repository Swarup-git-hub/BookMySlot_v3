import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  
  login: (user, token) => set({ 
    user, 
    token, 
    isAuthenticated: true 
  }),
  
  logout: () => set({ 
    user: null, 
    token: null, 
    isAuthenticated: false 
  }),

  setLoading: (isLoading) => set({ isLoading }),
  
  loadFromStorage: () => {
    const stored = localStorage.getItem("authData");
    if (stored) {
      const { user, token } = JSON.parse(stored);
      set({ user, token, isAuthenticated: !!token });
    }
  },

  saveToStorage: (user, token) => {
    localStorage.setItem("authData", JSON.stringify({ user, token }));
    set({ user, token, isAuthenticated: true });
  },

  clearStorage: () => {
    localStorage.removeItem("authData");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
