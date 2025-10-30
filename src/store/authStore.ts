import { create } from "zustand";
import type { User, LoginDto } from "../types/user.types";
import authService from "../services/auth.service";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginDto) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: authService.getStoredUser(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null,

    login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(credentials);
            set({
                user: response.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Error al iniciar sesión",
                isLoading: false,
            });
            throw error;
        }
    },

    logout: () => {
        authService.logout();
        set({
            user: null,
            isAuthenticated: false,
            error: null,
        });
    },

    setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
    },

    clearError: () => {
        set({ error: null });
    },
}));
