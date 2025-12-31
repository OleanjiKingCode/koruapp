"use client";

import { motion } from "motion/react";

type HighlightType = "highlight" | "underline" | "box" | "strike";

interface TextHighlightProps {
  children: React.ReactNode;
  type?: HighlightType;
  color?: string;
  delay?: number;
}

export function TextHighlight({
  children,
  type = "highlight",
  color = "#c385ee",
  delay = 0,
}: TextHighlightProps) {
  if (type === "highlight") {
    return (
      <span className="relative inline">
        <motion.span
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay, ease: "easeOut" }}
          className="absolute left-0 bottom-0 h-[40%] -z-10"
          style={{ backgroundColor: color }}
        />
        <span className="relative">{children}</span>
      </span>
    );
  }

  if (type === "underline") {
    return (
      <span className="relative inline">
        <motion.span
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
          className="absolute left-0 bottom-0 h-[3px]"
          style={{ backgroundColor: color }}
        />
        <span className="relative">{children}</span>
      </span>
    );
  }

  if (type === "box") {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
        className="relative inline px-2 py-1 rounded"
        style={{ 
          border: `2px solid ${color}`,
        }}
      >
        {children}
      </motion.span>
    );
  }

  if (type === "strike") {
    return (
      <span className="relative inline">
        <motion.span
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2"
          style={{ backgroundColor: color }}
        />
        <span className="relative opacity-60">{children}</span>
      </span>
    );
  }

  return <span>{children}</span>;
}








