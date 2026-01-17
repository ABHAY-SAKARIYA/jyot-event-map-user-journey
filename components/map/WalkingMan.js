
"use client";

import { motion } from "framer-motion";

export default function WalkingMan({ position, label = "YOU", offset = { x: -0.5, y: 1 } }) {
    if (!position) return null;

    return (
        <motion.div
            className="absolute z-[100] pointer-events-none"
            initial={false}
            animate={{
                left: `${position.x + (offset.x || 0)}%`,
                top: `${position.y + (offset.y || 0)}%`
            }}
            transition={{
                type: "spring",
                stiffness: 40,
                damping: 25,
                mass: 1,
                restDelta: 0.001
            }}
        >
            <div className="relative -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                <span className="text-md filter drop-shadow-md">👱🏻‍♂️</span>
                <div className="absolute -top-0.5 whitespace-nowrap bg-black text-white text-[5px] px-1 rounded font-bold uppercase tracking-widest">
                    {label}
                </div>
            </div>
        </motion.div>
    );
}
