import { useEffect, useState } from 'react';

export function useMouseParallax(enabled = true) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };

    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [enabled]);

  return pointer;
}
