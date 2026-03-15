import { createContext, useContext, useState, useCallback } from "react";
import { getSession, startSession } from "../api/client";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSessionState] = useState({ status: "disconnected", qr: null });
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const s = await getSession();
      setSessionState(s);
      return s;
    } catch (err) {
      console.error("Session refresh failed:", err);
      setSessionState({ status: "disconnected", qr: null });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startSessionAndRefresh = useCallback(async () => {
    try {
      const s = await startSession();
      setSessionState(s);
      return s;
    } catch (err) {
      console.error("Start session failed:", err);
      throw err;
    }
  }, []);

  const value = {
    session,
    setSession: setSessionState,
    refreshSession,
    startSession: startSessionAndRefresh,
    loading,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
