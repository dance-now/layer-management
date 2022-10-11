import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type User = {
  user: {
    uid: string;
  };
};

export const UserContext = createContext<User>({
  user: { uid: "" },
});

export const UserContextProvider = ({ children }: any) => {
  const [user, setUser]: [any, any] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (userDate) => {
      if (userDate) {
        // ログイン中
        setUser(userDate);
        setLoading(true);
      } else {
        // ログインされてない
        setUser("");
        setLoading(true);
        router.push("/login");
      }
    });
  }, []);
  return (
    <UserContext.Provider value={{ user }}>
      {loading && children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
