import { useEffect, useState } from "react";

export function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (ticking) {
        return;
      }
      ticking = true;

      requestAnimationFrame(() => {
        setOffset(window.scrollY * speed);

        ticking = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return offset;
}
