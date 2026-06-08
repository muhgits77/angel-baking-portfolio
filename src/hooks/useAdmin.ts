import { useEffect, useState, useCallback } from "react";

const PASSCODE = "angelbakes2026";
const STORAGE_KEY = "angel_admin_unlocked";

export function useAdmin() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [error, setError] = useState("");

  // Check persisted unlock on mount (persists across refreshes on this device)
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        setIsUnlocked(true);
      }
    } catch {}
  }, []);

  const unlock = useCallback((code: string, remember = true): boolean => {
    if (code.trim() === PASSCODE) {
      setIsUnlocked(true);
      setError("");
      setShowPrompt(false);
      if (remember) {
        try {
          localStorage.setItem(STORAGE_KEY, "1");
        } catch {}
      }
      return true;
    }
    setError("That passcode isn't quite right. Try again?");
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const openPrompt = useCallback(() => {
    setError("");
    setShowPrompt(true);
  }, []);

  const closePrompt = useCallback(() => {
    setShowPrompt(false);
    setError("");
  }, []);

  return {
    isAdmin: isUnlocked,
    showPrompt,
    error,
    unlock,
    lock,
    openPrompt,
    closePrompt,
  };
}
