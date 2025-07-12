import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "./components/layout/app.header";

function Layout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div>
      {!isAuthPage && <AppHeader />}
      <Outlet />
    </div>
  );
}

export default Layout;
