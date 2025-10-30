import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SOCKET_URL = API_URL.replace("/api/v1", "");

export const useWebSocket = () => {
    const { user, isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            return;
        }

        const socket = io(SOCKET_URL, {
            query: {
                userId: user.id,
            },
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            if (import.meta.env.DEV) {
                console.log("✅ WebSocket connected:", socket.id);
            }
        });

        socket.on("newNotification", (notification: Notification) => {
            console.log("🔔 Nueva notificación:", notification);

            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        });

        socket.on("unreadCount", (count: number) => {
            if (import.meta.env.DEV) {
                console.log("📊 Unread count updated:", count);
            }
            queryClient.invalidateQueries({
                queryKey: ["notifications", "unread-count"],
            });
        });

        socket.on("notifications", (notifications: unknown[]) => {
            if (import.meta.env.DEV) {
                console.log("📋 Notifications received:", notifications.length);
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
                console.log("🔌 WebSocket disconnected:", reason);
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
