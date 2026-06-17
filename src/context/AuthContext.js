"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, signInAnonymously } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { subscribeToUserSessions, deleteSessionFromFirestore } from "../lib/firestoreUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous auth failed", error);
          setLoading(false);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch sessions globally so it doesn't reload on page navigation
  useEffect(() => {
    let unsubscribeSessions;
    if (user) {
      setIsLoadingSessions(true);
      unsubscribeSessions = subscribeToUserSessions((realtimeSessions) => {
        setSessions(realtimeSessions);
        setIsLoadingSessions(false);
      });
    } else {
      setSessions([]);
      setIsLoadingSessions(false);
    }
    
    return () => {
      if (unsubscribeSessions) unsubscribeSessions();
    };
  }, [user]);

  const removeSession = async (sessionId) => {
    await deleteSessionFromFirestore(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <AuthContext.Provider value={{ user, loading, sessions, isLoadingSessions, removeSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
