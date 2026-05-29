"use client";

import { motion, useReducedMotion } from "motion/react";
import { createElement, type ReactNode } from "react";

type AsTag =
  | "div"
  | "section"
  | "article"
  | "header"
  | "footer"
  | "li"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  as?: AsTag;
};

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

export function Reveal({
  children,
  delay = 0,
  y = 28,
  duration = 0.7,
  once = true,
  className,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return createElement(as, { className }, children);
  }

  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}
