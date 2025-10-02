"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  label: string;
  value?: any;
}

interface DropdownProps {
  trigger?: ReactNode;
  items?: DropdownItem[];
  onSelect?: (item: DropdownItem) => void;
  isOpen?: boolean; // Control open state externally
  onClose?: () => void; // Callback when dropdown should close
}

export default function Dropdown({ 
  trigger, 
  items = [], 
  onSelect, 
  isOpen: externalIsOpen, 
  onClose 
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use external isOpen if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;
  const setOpen = externalIsOpen !== undefined ? (open: boolean) => {
    if (!open && onClose) onClose();
  } : setInternalOpen;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {trigger && (
        <div onClick={() => setOpen(!isOpen)} className="cursor-pointer">
          {trigger}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -21 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.2 }}
            className={`${trigger ? 'absolute mt-2' : ''} w-48 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-50`}
          >
            {items.map((item, index) => (
              <li
                key={item.value || index} // Use item value as key if available, fallback to index
                onClick={() => {
                  onSelect?.(item);
                  setOpen(false);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors text-right"
                dir="auto"
              >
                {item.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
