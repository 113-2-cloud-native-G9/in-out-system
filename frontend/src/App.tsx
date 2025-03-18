import { Menu } from "./components/custom/menu";

function App() {
    return (
        <>
            <Menu className="fixed top-0 h-12 min-w-dvw" />
            <div className="container mx-auto p-4 top-12 absolute">
                <p>Welcome to the dashboard</p>
            </div>
        </>
    );
}

export default App;
