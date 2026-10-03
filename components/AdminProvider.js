"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "mercadobolivar_admin";

const AdminContext = createContext({
  isAdmin: false,
  loaded: false,
  enterAdmin: () => {},
  exitAdmin: () => {},
});

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(saved);
    setLoaded(true);
  }, []);

  function enterAdmin() {
    setIsAdmin(true);
    window.localStorage.setItem(STORAGE_KEY, "true");
  }

  function exitAdmin() {
    setIsAdmin(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AdminContext.Provider value={{ isAdmin, loaded, enterAdmin, exitAdmin }}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
