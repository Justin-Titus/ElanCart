import { useEffect, useRef, useState } from 'react';

// Lightweight in-view hook using IntersectionObserver
export default function useInView({ root = null, rootMargin = '0px', threshold = 0.12 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            // once in view, we can unobserve to keep it simple
            observer.unobserve(node);
          }
        });
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold]);

  return [ref, inView];
}
