import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number; // ms
  decimals?: number;
  delay?: number; // ms — match your AOS delay
}

export function useCountUp({
  end,
  duration = 1800,
  decimals = 0,
  delay = 400,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          setTimeout(() => {
            const startTime = performance.now();

            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out-cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(parseFloat((eased * end).toFixed(decimals)));

              if (progress < 1) requestAnimationFrame(tick);
              else setValue(end);
            };

            requestAnimationFrame(tick);
          }, delay);

          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, decimals, delay]);

  return { value, ref };
}
