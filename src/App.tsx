import { AppRoutes } from "./routes";
import { useWebSocket } from "./hooks/useWebSocket";
import { Toaster } from "react-hot-toast";
import "./index.css";

function App() {
    useWebSocket();

    return (
        <>
            <Toaster position="top-right" />
            <AppRoutes />
        </>
    );
}

export default App;
