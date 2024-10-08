import { getCurrentUser } from "@/lib/appwrite";
import { createContext, useContext, useEffect, useState } from "react";
import { Models } from "react-native-appwrite";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

import DeletePostProvider from "./delete-post-provider";

interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: Models.Document | undefined;
  setUser: (user: Models.Document | undefined) => void;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

interface GlobalProviderProps {
  children: React.ReactNode;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Models.Document | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getCurrentUser();
    if (res.isSuccess) {
      setIsLoggedIn(true);
      setUser(res.data);
    } else {
      setIsLoggedIn(false);
      setUser(undefined);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return (
    <GlobalContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, isLoading, refetch }}
    >
      <PaperProvider>
        <DeletePostProvider>
          {children}
          <Toast />
        </DeletePostProvider>
      </PaperProvider>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }

  return context;
};
