// Delay timer hook
// Purpose: Limits execution frequencies for text inputs and location lookups.
import { useState, useEffect } from 'react';
export default function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
