'use client';

import { useEffect, useRef } from 'react';

export default function LightGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!glowRef.current) return;

      const x = e.clientX;
      const y = e.clientY;

      // Update the glow position
      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(
          600px circle at ${x}px ${y}px,
          rgba(245, 165, 120, 0.15),
          transparent 40%
        )`;
      }
    };

    // Throttle the animation for better performance
    let ticking = false;
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', throttledMouseMove);

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(600px circle at 0px 0px, rgba(245, 165, 120, 0.15), transparent 40%)',
      }}
    />
  );
}
