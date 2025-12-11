import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = (email, password) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signin = (email, password) => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = () => {
    if (!auth) return Promise.reject(new Error("Firebase not initialized"));
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    if (!auth) return Promise.resolve();
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    signin,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthContextProvider");
  return context;
};
