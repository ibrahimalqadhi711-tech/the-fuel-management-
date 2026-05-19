import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to handle rate limiting and cooldown logic for buttons.
 * @param cooldownSeconds Number of seconds to wait before the button is re-enabled.
 */
export function useRateLimit(cooldownSeconds: number = 30) {
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<any>(null);

  const startCooldown = useCallback(() => {
    setCooldown(cooldownSeconds);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start a new timer
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    cooldown,
    isCooldown: cooldown > 0,
    startCooldown,
  };
}
