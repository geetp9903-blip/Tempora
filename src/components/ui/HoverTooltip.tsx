"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

interface HoverTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function HoverTooltip({ children, content, className = "" }: HoverTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, isTop: false });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isTop = window.innerHeight - rect.bottom < 200; // if less than 200px below, show on top
      
      setCoords({ 
        x: rect.left + rect.width / 2, 
        y: isTop ? rect.top - 8 : rect.bottom + 8,
        isTop
      });
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div 
      ref={triggerRef} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center w-full h-full ${className}`}
    >
      {children}
      
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{ 
                left: coords.x, 
                top: coords.y,
                transform: `translate(-50%, ${coords.isTop ? '-100%' : '0'})`
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: coords.isTop ? 5 : -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl w-64 max-w-[90vw]"
              >
                {content}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
