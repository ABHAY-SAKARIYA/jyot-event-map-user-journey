
"use client";

import { motion } from "framer-motion";

export default function WalkingMan({ position, label = "YOU", offset = { x: -0.3, y: 0.5 } }) {
    if (!position) return null;

    return (
        <motion.div
            className="absolute z-[100] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
            }}
            initial={false}
            animate={{
                x: `${offset.x || 0}%`,
                y: `${offset.y || 0}%`
            }}
            transition={{
                type: "spring",
                stiffness: 40,
                damping: 25,
                mass: 1,
                restDelta: 0.001
            }}
        >
            <div className="relative w-8 h-8 flex items-center justify-center">
                <span className="text-sm filter drop-shadow-md">👱🏻‍♂️</span>
                <div className="absolute -top-0.5 whitespace-nowrap bg-black text-white text-[5px] px-1 rounded font-bold uppercase tracking-widest">
                    {label}
                </div>
            </div>
        </motion.div>
    );
}
