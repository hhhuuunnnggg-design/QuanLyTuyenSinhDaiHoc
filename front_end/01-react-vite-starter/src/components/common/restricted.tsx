import { useCurrentApp } from "@/components/context/app.context";

interface RestrictedProps {
  permission: string;
  children: React.ReactNode;
}

const Restricted: React.FC<RestrictedProps> = ({ permission, children }) => {
  const { user, isAuthenticated, loading } = useCurrentApp();

  // Wait for loading to complete
  if (loading) {
    return null;
  }

  const hasPermission =
    (isAuthenticated &&
      user?.role?.permissions?.some((p) => p.apiPath === permission)) ||
    false;

  return hasPermission ? <>{children}</> : null;
};

export default Restricted;
