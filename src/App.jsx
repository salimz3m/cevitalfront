// App.jsx — mis à jour Sprint 5 + 6
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext"; // ← Sprint 6
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import KeepContact from "./pages/KeepContact";
import Livreur from "./pages/Livreur";
import Stock from "./pages/Stock";
import Landing from "./pages/Landing";
import PlanifWorkflow from "./pages/planification/PlanifWorkflow";
import PlanifIntelligent from "./pages/planification/PlanifIntelligent";
import TransportWorkflow from "./pages/transport/TransportWorkflow";
import TransportIntelligent from "./pages/transport/TransportIntelligent"; // ← Sprint 5

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
      <ToastProvider>
        {" "}
        {/* ← Sprint 6 : wraps tout l'app */}
        <BrowserRouter>
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* Pages protégées */}
            <Route element={<PrivateRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<KeepContact />} />
                <Route path="/livreur" element={<Livreur />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/planification" element={<PlanifWorkflow />} />
                <Route
                  path="/planification/intel"
                  element={<PlanifIntelligent />}
                />
                <Route path="/transport" element={<TransportWorkflow />} />
                <Route
                  path="/transport/intel"
                  element={<TransportIntelligent />}
                />{" "}
                {/* ← Sprint 5 */}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
