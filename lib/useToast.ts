import { useCallback, useRef, useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((nextMessage: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setMessage(nextMessage);
    timeoutRef.current = setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, 2400);
  }, []);

  return { toastMessage: message, showToast };
}
