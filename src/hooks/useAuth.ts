import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import authService from "../services/auth.service";
import type { LoginDto, RegisterWorkerDto } from "../types/user.types";

export const useLogin = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginDto) => authService.login(credentials),
        onSuccess: (data) => {
            setUser(data.user);
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });

            navigate("/dashboard");
        },
        onError: (error: Error) => {
            console.error("Login error:", error);
            throw error;
        },
    });
};

export const useRegisterWorker = (skipNavigation: boolean = false) => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (registerData: RegisterWorkerDto) =>
            authService.registerWorker(registerData),
        onSuccess: (data) => {
            setUser(data.user);
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });

            // Solo navegar si no se especifica skipNavigation
            if (!skipNavigation) {
                navigate("/trabajador");
            }
        },
        onError: (error: Error) => {
            console.error("Register error:", error);
            throw error;
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            authService.logout();
        },
        onSuccess: () => {
            logout();
            queryClient.clear();
            navigate("/login");
        },
    });
};

export const useCurrentUser = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ["currentUser"],
        queryFn: () => authService.getCurrentUser(),
        enabled: isAuthenticated,
        staleTime: Infinity,
    });
};

export const useIsAuthenticated = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated;
};
