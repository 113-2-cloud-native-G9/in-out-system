import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";
import { Menu } from "./components/custom/menu";
import { routes, menuItems } from "@/config/routes";

function AppContent() {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";

    return (
        <>
            {!isLoginPage && <Menu items={menuItems} />}
            <div
                className={
                    isLoginPage
                        ? "flex items-center justify-center"
                        : "container mx-auto p-4 overflow-y-auto md:max-h-[calc(100dvh-5rem)]"
                }
            >
                <Routes>
                    {routes.map((route, index) => (
                        <Route
                            key={index}
                            path={route.path}
                            element={route.element}
                        />
                    ))}
                </Routes>
            </div>
        </>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
