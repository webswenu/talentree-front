import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // P-61: antes en false. Sin esto, tras un corte de red la pantalla
            // se quedaba con el error pegado hasta que el usuario recargaba a
            // mano; volver a la pestaña ahora revalida solo.
            refetchOnWindowFocus: true,
            // Reintentar un 401, un 403 o un 404 no sirve de nada: la respuesta
            // va a ser la misma y solo retrasa el mensaje de error. Se
            // reintenta lo que sí puede ser transitorio (red y 5xx).
            retry: (fallosPrevios, error: unknown) => {
                const status = (error as { response?: { status?: number } })
                    ?.response?.status;

                if (status && status >= 400 && status < 500) return false;

                return fallosPrevios < 2;
            },
            staleTime: 5 * 60 * 1000,
        },
    },
});

// P-70. El componente ErrorBoundary ya existía completo en el proyecto, pero
// nadie lo montaba: cualquier error de dibujado dejaba la pantalla en blanco,
// sin mensaje y sin salida. Va por fuera del proveedor de react-query para que
// también atrape los fallos que ocurran dentro de él.
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>
);
