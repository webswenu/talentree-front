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
    setActiveCompany: (companyId: string) => Promise<void>;
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
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    },

    /**
     * Cambia la empresa sobre la que opera un representante con varias.
     *
     * El backend valida la pertenencia y devuelve el usuario ya actualizado,
     * asi que aqui no se arma el nuevo estado a mano: se usa lo que responde el
     * servidor. Si se compusiera localmente, un rechazo del backend dejaria la
     * pantalla mostrando una empresa sobre la que en realidad no se esta
     * operando.
     */
    setActiveCompany: async (companyId: string) => {
        const user = await authService.setActiveCompany(companyId);
        set({ user });
    },

    clearError: () => {
        set({ error: null });
    },
}));
