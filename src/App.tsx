import { AppRoutes } from "./routes";
import { useWebSocket } from "./hooks/useWebSocket";
import "./index.css";

function App() {
    useWebSocket();

    return <AppRoutes />;
}

export default App;
