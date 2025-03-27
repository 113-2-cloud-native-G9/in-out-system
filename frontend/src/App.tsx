import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "./components/custom/menu";
import { routes, menuItems } from "@/config/routes";

function App() {
    return (
        <Router>
            <>
                <Menu items={menuItems} />
                <div
                    className="container mx-auto p-4 overflow-hidden"
                    style={{
                        maxHeight: "calc(100vh - 5rem)",
                    }}
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
        </Router>
    );
}

export default App;
