import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/api.types";
import { avisarError } from "../utils/toastBridge";
import { getApiErrorMessage } from "../utils/apiError";

/**
 * P-78. Avisa de una denegación de permiso, en vez de dejar la pantalla vacía
 * y muda. El texto sale del propio backend cuando lo trae, porque suele decir
 * el motivo concreto ("pertenece a otra empresa", "no está aprobado").
 */
const notificarSinPermiso = (error: unknown): void => {
    avisarError(
        getApiErrorMessage(error, "No tienes permiso para realizar esta acción.")
    );
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";


class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("accessToken");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => {
                if (
                    response.data &&
                    typeof response.data === "object" &&
                    "success" in response.data
                ) {
                    return {
                        ...response,
                        data: response.data.data,
                    };
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken =
                            localStorage.getItem("refreshToken");
                        const response = await axios.post<
                            ApiResponse<{ accessToken: string }>
                        >(`${API_URL}/auth/refresh`, {
                            refreshToken,
                        });

                        const accessToken = response.data.data.accessToken;
                        localStorage.setItem("accessToken", accessToken);
                        this.api.defaults.headers.common[
                            "Authorization"
                        ] = `Bearer ${accessToken}`;

                        return this.api(originalRequest);
                    } catch (refreshError) {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        window.location.href = "/login";
                        return Promise.reject(refreshError);
                    }
                }

                // P-78. El interceptor solo contemplaba el 401. Cuando el
                // servidor denegaba el acceso con un 403, la pantalla no decía
                // absolutamente nada y mostraba los listados vacíos, así que el
                // usuario concluía que se habían borrado los datos.
                //
                // Es además el modo de fallar de AUT-12: al iniciar sesión con
                // otro rol en una segunda pestaña, localStorage —que es
                // compartido— pisa la sesión de la primera. La pestaña vieja
                // sigue mostrando el menú y el nombre del usuario anterior
                // porque el estado de React no cambió, pero cada petición sale
                // ya con el token del otro y vuelve 403.
                if (error.response?.status === 403) {
                    notificarSinPermiso(error);
                }

                return Promise.reject(error);
            }
        );

        this.escucharCambioDeSesionEnOtraPestana();
    }

    /**
     * localStorage es compartido por todas las pestañas del mismo sitio, así
     * que iniciar sesión en una cambia la sesión de todas. El evento `storage`
     * solo llega a las OTRAS pestañas, que es exactamente lo que hace falta:
     * avisar a la que quedó mostrando una sesión que ya no es la suya.
     */
    private escucharCambioDeSesionEnOtraPestana() {
        if (typeof window === "undefined") return;

        window.addEventListener("storage", (event) => {
            if (event.key !== "user" && event.key !== "accessToken") return;
            if (event.oldValue === event.newValue) return;

            // Recargar es lo correcto y no cerrar sesión: la sesión nueva es
            // válida, lo que está viejo es lo que esta pestaña tiene en memoria.
            window.location.reload();
        });
    }

    public get<T>(url: string, config?: AxiosRequestConfig) {
        return this.api.get<T>(url, config);
    }

    public post<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ) {
        return this.api.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
        return this.api.put<T>(url, data, config);
    }

    public patch<T>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ) {
        return this.api.patch<T>(url, data, config);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig) {
        return this.api.delete<T>(url, config);
    }
}

const apiService = new ApiService();
export { apiService };
export default apiService;
