import { RootState } from "@/redux/store";
import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface IAppContext {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  setUser: (v: IUser) => void;
  user: IUser | null;
  loading: boolean;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync with Redux state
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const reduxIsAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const reduxLoading = useSelector((state: RootState) => state.auth.loading);

  useEffect(() => {
    console.log("AppProvider - Syncing with Redux:", {
      reduxUser,
      reduxIsAuthenticated,
      reduxLoading,
    });
    setUser(reduxUser);
    setIsAuthenticated(reduxIsAuthenticated);
    setLoading(reduxLoading);
  }, [reduxUser, reduxIsAuthenticated, reduxLoading]);

  return (
    <CurrentAppContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        loading,
      }}
    >
      {props.children}
    </CurrentAppContext.Provider>
  );
};

export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);

  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be used within <CurrentAppContext.Provider>"
    );
  }

  return currentAppContext;
};
