import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu } from "./components/custom/menu";
import { routes, menuItems } from "@/config/routes";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Menu className="fixed top-0 left-0 right-0 z-50" items={menuItems} />
                <div className="container mx-auto p-4 mt-16">
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
            </div>
        </Router>
    );
}

export default App;

