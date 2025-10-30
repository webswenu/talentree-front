import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { ApiResponse } from "../types/api.types";

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

                return Promise.reject(error);
            }
        );
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
