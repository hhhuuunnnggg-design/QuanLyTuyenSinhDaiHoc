import { useCurrentApp } from "@/components/context/app.context";

interface RestrictedProps {
  permission: string;
  method?: string;
  children: React.ReactNode;
}

const Restricted: React.FC<RestrictedProps> = ({
  permission,
  method,
  children,
}) => {
  const { user, isAuthenticated, loading } = useCurrentApp();

  // Wait for loading to complete
  if (loading) {
    return null;
  }

  const hasPermission =
    (isAuthenticated &&
      user?.role?.permissions?.some((p) => {
        const pathMatch = p.apiPath === permission;
        const methodMatch = method ? p.method === method : true;
        return pathMatch && methodMatch;
      })) ||
    false;

  return hasPermission ? <>{children}</> : null;
};

export default Restricted;
