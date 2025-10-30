type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
    duration?: number;
    position?:
        | "top-right"
        | "top-left"
        | "bottom-right"
        | "bottom-left"
        | "top-center"
        | "bottom-center";
}

class ToastManager {
    private container: HTMLDivElement | null = null;

    private ensureContainer() {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "toast-container";
            this.container.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        pointer-events: none;
      `;
            document.body.appendChild(this.container);
        }
        return this.container;
    }

    private show(message: string, type: ToastType, options: ToastOptions = {}) {
        const container = this.ensureContainer();
        const toast = document.createElement("div");

        const colors = {
            success: "bg-green-500",
            error: "bg-red-500",
            info: "bg-blue-500",
            warning: "bg-yellow-500",
        };

        const icons = {
            success: "",
            error: "",
            info: "9",
            warning: "�",
        };

        toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 pointer-events-auto transform transition-all duration-300 translate-x-0 opacity-100`;
        toast.innerHTML = `
      <span class="font-bold text-lg">${icons[type]}</span>
      <span>${message}</span>
    `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = "translateX(0)";
            toast.style.opacity = "1";
        }, 10);

        const duration = options.duration || 3000;
        setTimeout(() => {
            toast.style.transform = "translateX(100%)";
            toast.style.opacity = "0";
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    success(message: string, options?: ToastOptions) {
        this.show(message, "success", options);
    }

    error(message: string, options?: ToastOptions) {
        this.show(message, "error", options);
    }

    info(message: string, options?: ToastOptions) {
        this.show(message, "info", options);
    }

    warning(message: string, options?: ToastOptions) {
        this.show(message, "warning", options);
    }
}

export const toast = new ToastManager();
