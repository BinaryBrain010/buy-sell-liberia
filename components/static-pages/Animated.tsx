"use client";

import { motion, Variants } from "framer-motion";
import * as React from "react";

// Simple fade-up for elements
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

// Stagger children appearance
export function FadeInStagger({
  children,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  as?: any;
  className?: string;
}) {
  // Memoize the motion wrapper to avoid creating a new component type each render
  const MTag = React.useMemo(() => motion(Tag as any), [Tag]);
  const childArray = React.Children.toArray(children);
  return (
    <MTag
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={className}
    >
      {childArray.map((child, i) => (
        <motion.div key={(child as any)?.key ?? i} variants={item}>
          {child as any}
        </motion.div>
      ))}
    </MTag>
  );
}

// Convenience component for animated list
export function AnimatedList({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {items.map((node, i) => (
        <motion.li key={i} variants={item}>
          {node}
        </motion.li>
      ))}
    </motion.ul>
  );
}
