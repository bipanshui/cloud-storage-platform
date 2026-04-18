import PropTypes from "prop-types";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Spinner from "@/components/common/Spinner";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import FilesPage from "@/pages/FilesPage";
import StarredPage from "@/pages/StarredPage";
import TrashPage from "@/pages/TrashPage";
import RecentPage from "@/pages/RecentPage";

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate replace to="/dashboard" /> : children;
}

PublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-neutral-500">404</p>
        <h1 className="mt-4 text-3xl font-bold text-neutral-900">Page not found</h1>
        <p className="mt-3 text-neutral-500">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/files" element={<FilesPage />} />
          <Route path="/files/:folderId" element={<FilesPage />} />
          <Route path="/recent" element={<RecentPage />} />
          <Route path="/starred" element={<StarredPage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;