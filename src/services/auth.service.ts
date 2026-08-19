import apiService from "./api.service";
import type {
    LoginDto,
    AuthResponse,
    RegisterWorkerDto,
    User,
} from "../types/user.types";

class AuthService {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const { data } = await apiService.post<AuthResponse>(
            "/auth/login",
            credentials
        );

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        return data;
    }

    async registerWorker(
        registerData: RegisterWorkerDto
    ): Promise<AuthResponse> {
        const { data } = await apiService.post<AuthResponse>(
            "/auth/register/worker",
            registerData
        );

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        return data;
    }

    async logout(): Promise<void> {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    }

    /**
     * Es la única llamada de este servicio que no declaraba el tipo, así que
     * `data` quedaba inferido como `{}` y `setUser(usuarioFresco)` no
     * compilaba. El error venía del commit del selector de empresa y llevaba
     * días en `main` sin que nadie lo notara, porque ese commit nunca se llegó
     * a construir: hizo caer el primer build de Amplify que lo incluyó.
     */
    async getCurrentUser(): Promise<User> {
        const { data } = await apiService.get<User>("/auth/me");
        return data;
    }

    /**
     * Cambia la empresa sobre la que opera un representante con varias.
     * El backend devuelve el usuario ya actualizado, y se guarda en
     * localStorage para que un refresco de pagina no vuelva a la anterior.
     */
    async setActiveCompany(companyId: string): Promise<User> {
        const { data } = await apiService.patch<User>(
            `/auth/empresa-activa/${companyId}`
        );

        localStorage.setItem("user", JSON.stringify(data));

        return data;
    }

    getStoredUser() {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    }

    getToken() {
        return localStorage.getItem("accessToken");
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default new AuthService();
