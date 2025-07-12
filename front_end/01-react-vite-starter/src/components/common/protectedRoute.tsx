import { useCurrentApp } from "@/components/context/app.context";
import { message } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  permission: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  permission,
  children,
}) => {
  const { user, isAuthenticated, loading } = useCurrentApp();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ProtectedRoute - User:", user);
    console.log("ProtectedRoute - IsAuthenticated:", isAuthenticated);
    console.log("ProtectedRoute - Loading:", loading);
    console.log("ProtectedRoute - Permission required:", permission);

    // Wait for loading to complete
    if (loading) {
      console.log("ProtectedRoute - Still loading, waiting...");
      return;
    }

    if (!isAuthenticated || !user) {
      console.log("ProtectedRoute - Not authenticated or no user");
      message.error("Bạn chưa đăng nhập!");
      navigate("/login");
      return;
    }

    if (!user.role) {
      console.log("ProtectedRoute - User has no role");
      message.error("Tài khoản không có vai trò!");
      navigate("/");
      return;
    }

    if (!user.role.permissions) {
      console.log("ProtectedRoute - User role has no permissions");
      message.error("Tài khoản không có quyền!");
      navigate("/");
      return;
    }

    const hasPermission = user.role.permissions.some(
      (p) => p.apiPath === permission
    );

    console.log("ProtectedRoute - User permissions:", user.role.permissions);
    console.log("ProtectedRoute - Has permission:", hasPermission);

    if (!hasPermission) {
      message.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
  }, [user, isAuthenticated, loading, permission, navigate]);

  // Show loading or wait for authentication check
  if (loading) {
    console.log("ProtectedRoute - Rendering loading state");
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    console.log("ProtectedRoute - Rendering null (not authenticated)");
    return null;
  }

  if (!user.role || !user.role.permissions) {
    console.log("ProtectedRoute - Rendering null (no role/permissions)");
    return null;
  }

  const hasPermission = user.role.permissions.some(
    (p) => p.apiPath === permission
  );
  console.log("ProtectedRoute - Rendering children:", hasPermission);

  return hasPermission ? <>{children}</> : null;
};

export default ProtectedRoute;
