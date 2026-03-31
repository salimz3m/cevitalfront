import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import KeepContact from "./pages/KeepContact";
import Planification from "./pages/Planification";
import Livreur from "./pages/Livreur";
import Stock from "./pages/Stock";
import Landing from "./pages/Landing";

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

function PrivateRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pages publiques — accessibles sans connexion */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Pages protégées — connexion requise */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<KeepContact />} />
              <Route path="/planification" element={<Planification />} />
              <Route path="/livreur" element={<Livreur />} />
              <Route path="/stock" element={<Stock />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
