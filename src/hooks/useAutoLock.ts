import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export function useAutoLock() {
  const logout = useStore(state => state.logout);
  const autoLockMinutes = useStore(state => state.autoLockMinutes);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (autoLockMinutes > 0) {
        timeoutRef.current = setTimeout(() => {
          logout();
        }, autoLockMinutes * 60 * 1000);
      }
    };

    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [logout, autoLockMinutes]);
}
