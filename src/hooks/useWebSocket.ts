import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const SOCKET_URL = API_URL.replace("/api/v1", "");

export const useWebSocket = () => {
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        /**
         * El servidor saca la identidad del TOKEN, no de lo que le mandemos.
         * Antes se enviaba `query: { userId }` y el canal le creía: bastaba
         * conocer el UUID de otra persona para leer sus avisos.
         */
        const socket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem("accessToken"),
            },
            transports: ["websocket", "polling"],
        });

        // Si el token no sirve, el servidor cierra la conexión y avisa por aquí.
        socket.on("authError", () => {
            socket.disconnect();
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            // Sin cuerpo: la conexión no requiere ninguna acción.
        });

        socket.on("newNotification", () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        });

        socket.on("unreadCount", () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        });

        socket.on("notifications", (notifications: unknown[]) => {
            if (import.meta.env.DEV) {
            }
            queryClient.setQueryData(["notifications"], notifications);
        });

        socket.on("connect_error", (error) => {
            const errorMessage = error.message || String(error);
            if (!errorMessage.includes("Invalid namespace")) {
                console.error("❌ WebSocket connection error:", error);
            }
        });

        socket.on("disconnect", (reason) => {
            if (
                reason !== "io client disconnect" &&
                reason !== "io server disconnect"
            ) {
            }
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, user?.id, queryClient]);

    const getNotifications = () => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("getNotifications");
        }
    };

    const markAsRead = (notificationId: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("markAsRead", notificationId);
        }
    };

    const markAllAsRead = () => {
        if (socketRef.current?.connected) {
            socketRef.current.emit("markAllAsRead");
        }
    };

    return {
        socket: socketRef.current,
        isConnected: socketRef.current?.connected || false,
        getNotifications,
        markAsRead,
        markAllAsRead,
    };
};
