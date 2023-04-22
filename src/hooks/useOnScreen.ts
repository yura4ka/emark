import { type RefObject, useEffect, useMemo } from "react";

export function useOnScreen(
  ref: RefObject<Map<number, HTMLDivElement>>,
  callback: (id: number) => void
) {
  const observer = useMemo(
    () =>
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = +(e.target.getAttribute("itemid") || -1);
            callback(id);
          }
        });
      }),
    [callback]
  );

  useEffect(() => {
    if (!ref.current) return;
    for (const el of ref.current.values()) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [observer, ref]);
}
