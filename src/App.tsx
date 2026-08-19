import { AppRoutes } from "./routes";
import { useWebSocket } from "./hooks/useWebSocket";
import { useSesionCompartidaEntrePestanas } from "./hooks/useSesionCompartidaEntrePestanas";
import { Toaster } from "react-hot-toast";
import "./index.css";

function App() {
    useWebSocket();
    // Si otra pestana del mismo navegador cambia la sesion, esta se recarga
    // para no quedar mostrando la interfaz de un rol con los datos de otro.
    useSesionCompartidaEntrePestanas();

    return (
        <>
            <Toaster position="top-right" />
            <AppRoutes />
        </>
    );
}

export default App;
