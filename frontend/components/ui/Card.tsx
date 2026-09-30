"use client";

import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Card({ children, className = "", id }: CardProps) {
  return (
    <div id={id} className={`card ${className}`}>
      {children}

      <style jsx>{`
        .card {
          background: var(--white);
          border: 1px solid var(--neutral-300);
          border-radius: var(--card-radius);
          padding: var(--space-5);
          box-shadow: var(--card-shadow);
          transition: box-shadow var(--transition-fast);
        }
        @media (max-width: 639px) {
          .card {
            padding: var(--space-4);
          }
        }
      `}</style>
    </div>
  );
}
