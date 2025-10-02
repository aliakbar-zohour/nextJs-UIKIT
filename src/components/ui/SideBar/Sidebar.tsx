"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCloseOutline } from "react-icons/io5";
import Button from "../Button/Button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const sidebarVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999999] flex justify-start"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="bg-white border-l border-gray-300 w-1/3 h-full p-6 relative shadow-2xl right-0"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            transition={{ type: "tween", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              onClick={onClose}
              variant="custom"
              shape="circle"
              size="md"
              icon={<IoCloseOutline className="text-gray-500 font-bold" />}
              className="bg-white border border-gray-200 w-12 h-12 text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-xl "
              style={{
                position: "absolute",
                top: ".7rem",
                left: "-3.7rem",
                zIndex: 1000,
              }}
            />

            <div className="h-full w-full overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
