// frontend/src/App.jsx — mis à jour Sprint 7 + Sprint 8
// Ajoute les routes /stock/* et /admin/*

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Sidebar, { sidebarWidth } from "./components/Sidebar";

// ── Pages existantes ────────────────────────────────────────
import Login from "./pages/Login";
import Register from "./pages/Register";

import KeepContact from "./pages/KeepContact";

// Planification
import PlanifWorkflow from "./pages/planification/PlanifWorkflow";
import PlanifIntelligent from "./pages/planification/PlanifIntelligent";

// Transport
import TransportWorkflow from "./pages/transport/TransportWorkflow";
import TransportIntelligent from "./pages/transport/TransportIntelligent";

// ── Sprint 7 — Stock ────────────────────────────────────────
import StockDashboard from "./pages/stock/StockDashboard";
import CarteStocks from "./pages/stock/CarteStocks";
import StockCLRDetail from "./pages/stock/StockCLRDetail";
import MouvementsStock from "./pages/stock/MouvementsStock";
import StockIntelligent from "./pages/stock/StockIntelligent";

// ── Sprint 8 — Admin ────────────────────────────────────────
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import ModulesConfig from "./pages/admin/ModulesConfig";
import CompanySettings from "./pages/admin/CompanySettings";
import DataManager from "./pages/admin/DataManager";
import Infrastructure from "./pages/admin/Infrastructure";
import Commercial from "./pages/modules/Commercial";
import Kpi from "./pages/modules/KPIDashboard";
// ─── Guards ──────────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f1117",
          color: "#3b82f6",
        }}
      >
        <i
          className="fa-solid fa-circle-notch fa-spin"
          style={{ fontSize: "32px" }}
        />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return children;
}

function RequireGuest({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── Layout avec sidebar ─────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f1117" }}>
      <Sidebar />
      <main
        style={{ marginLeft: `${sidebarWidth}px`, flex: 1, minHeight: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}

// ─── App racine ───────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />
            <Route path="/keep-contact" element={<KeepContact />} />
            <Route
              path="/login"
              element={
                <RequireGuest>
                  <Login />
                </RequireGuest>
              }
            />
            <Route
              path="/register"
              element={
                <RequireGuest>
                  <Register />
                </RequireGuest>
              }
            />
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <AppLayout>
                    <StockDashboard />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── Planification ── */}
            <Route
              path="/planification"
              element={
                <RequireAuth roles={["admin", "planification"]}>
                  <AppLayout>
                    <PlanifWorkflow />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/planification/intelligent"
              element={
                <RequireAuth roles={["admin", "planification"]}>
                  <AppLayout>
                    <PlanifIntelligent />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── Transport ── */}
            <Route
              path="/transport"
              element={
                <RequireAuth roles={["admin", "transport"]}>
                  <AppLayout>
                    <TransportWorkflow />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/transport/intelligent"
              element={
                <RequireAuth roles={["admin", "transport"]}>
                  <AppLayout>
                    <TransportIntelligent />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── Stock Sprint 7 ── */}
            <Route
              path="/stock"
              element={
                <RequireAuth
                  roles={[
                    "admin",
                    "planification",
                    "transport",
                    "keep_contact",
                  ]}
                >
                  <AppLayout>
                    <StockDashboard />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock/carte"
              element={
                <RequireAuth
                  roles={[
                    "admin",
                    "planification",
                    "transport",
                    "keep_contact",
                  ]}
                >
                  <AppLayout>
                    <CarteStocks />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock/clr/:id"
              element={
                <RequireAuth
                  roles={[
                    "admin",
                    "planification",
                    "transport",
                    "keep_contact",
                  ]}
                >
                  <AppLayout>
                    <StockCLRDetail />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock/mouvements"
              element={
                <RequireAuth
                  roles={[
                    "admin",
                    "planification",
                    "transport",
                    "keep_contact",
                  ]}
                >
                  <AppLayout>
                    <MouvementsStock />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/stock/intelligent"
              element={
                <RequireAuth
                  roles={[
                    "admin",
                    "planification",
                    "transport",
                    "keep_contact",
                  ]}
                >
                  <AppLayout>
                    <StockIntelligent />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── Admin Sprint 8 ── */}
            <Route
              path="/admin"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <AdminDashboard />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <UsersManagement />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/modules"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <ModulesConfig />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/company"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <CompanySettings />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/data"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <DataManager />
                  </AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/infrastructure"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <Infrastructure />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── KPI Dashboard Sprint 14 ── */}
            <Route
              path="admin/kpi"
              element={
                <RequireAuth roles={["admin"]}>
                  <AppLayout>
                    <Kpi />
                  </AppLayout>
                </RequireAuth>
              }
            />
            {/* ── Commercial Sprint 13 ── */}
            <Route
              path="/commercial"
              element={
                <RequireAuth roles={["admin", "planification", "commercial"]}>
                  <AppLayout>
                    <Commercial />
                  </AppLayout>
                </RequireAuth>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
