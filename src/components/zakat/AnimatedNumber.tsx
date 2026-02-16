import { useState, useEffect, useCallback, useRef } from "react";
import { formatCurrency } from "@/lib/zakat";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  format?: boolean;
}

const AnimatedNumber = ({ value, duration = 800, className, format = true }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  const rafRef = useRef<number>();

  const animate = useCallback(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = end;
      }
    };

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [value, duration]);

  useEffect(() => {
    animate();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <span className={className}>
      {format ? formatCurrency(Math.round(display)) : Math.round(display).toLocaleString()}
    </span>
  );
};

export default AnimatedNumber;
