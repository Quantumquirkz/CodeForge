import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import StyleConfig from "./pages/StyleConfig";
import Chats from "./pages/Chats";
import Import from "./pages/Import";
import Analyze from "./pages/Analyze";
import SendManual from "./pages/SendManual";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex gap-4 flex-wrap">
        <Link to="/" className="text-emerald-400 font-semibold hover:underline">
          Dashboard
        </Link>
        <Link to="/style" className="text-slate-300 hover:text-white">
          Estilo
        </Link>
        <Link to="/chats" className="text-slate-300 hover:text-white">
          Chats
        </Link>
        <Link to="/import" className="text-slate-300 hover:text-white">
          Importar
        </Link>
        <Link to="/analyze" className="text-slate-300 hover:text-white">
          Analizar
        </Link>
        <Link to="/send" className="text-slate-300 hover:text-white">
          Enviar
        </Link>
      </nav>
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/style" element={<StyleConfig />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/import" element={<Import />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/send" element={<SendManual />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
