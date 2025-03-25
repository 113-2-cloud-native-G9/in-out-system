import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "./components/custom/menu";
import { routes, menuItems } from "@/config/routes";

function App() {
    return (
        <Router>
            <>
                <Menu className="fixed top-0 left-0 right-0 z-50" items={menuItems} />
                <div className="container mx-auto p-4 pt-20 max-h-dvh">
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

