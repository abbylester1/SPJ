"use client";

import { useEffect, useRef } from "react";
import { splitText } from "kugiri";

type Split = { lines: HTMLElement[]; masks: HTMLElement[]; revert: () => void };

/**
 * Reveals a heading line by line using the lines the browser actually painted.
 * The hero plays on mount; everything else plays the first time it scrolls into view.
 */
export default function RevealHeadline({
  children,
  className,
  as: Tag = "h1",
  onView = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  onView?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: Split | null = null;

    const play = () => {
      try {
        split = splitText(el, { type: ["lines"], mask: "lines" });
        el.style.opacity = "1";
        const animations = split.lines.map((line, index) =>
          line.animate(
            [
              { transform: "translateY(110%)", opacity: 0 },
              { transform: "translateY(0)", opacity: 1 },
            ],
            { duration: 800, delay: index * 90, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "backwards" }
          )
        );
        Promise.all(animations.map((a) => a.finished)).then(() => {
          split?.masks.forEach((mask) => (mask.style.clipPath = "none"));
        });
      } catch {
        el.style.opacity = "1";
      }
    };

    if (!onView) {
      play();
      return () => split?.revert();
    }

    el.style.opacity = "0";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          play();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      split?.revert();
      el.style.opacity = "";
    };
  }, [onView]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
