import { useState, useCallback } from "react";

export function useBestScore(storageKey, { better = "higher" } = {}) {
  const [best, setBest] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    return raw != null ? JSON.parse(raw) : null; // number or {value, meta}
  });

  const isBetter = useCallback(
    (a, b) => {
      if (b == null) return true;
      const av = typeof a === "object" ? a.value : a;
      const bv = typeof b === "object" ? b.value : b;
      return better === "lower" ? av < bv : av > bv;
    },
    [better]
  );

  const submit = useCallback(
    (value, meta) => {
      const payload = meta === undefined ? value : { value, meta };
      if (isBetter(payload, best)) {
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setBest(payload);
        return true;
      }
      return false;
    },
    [best, isBetter, storageKey]
  );

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setBest(null);
  }, [storageKey]);

  return { best, submit, clear };
}
