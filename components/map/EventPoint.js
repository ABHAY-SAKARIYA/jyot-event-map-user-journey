"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";


export default function EventPoint({ event, isSelected, onClick }) {
    const { position, color, icon, title } = event;

    // Generate random delay once
    const randomDelay = useMemo(() => Math.random() * 2, []);

    return (
        <motion.button
            className="absolute flex flex-col items-center justify-center focus:outline-none" // Removed 'p-2' to control sizing better
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                x: "-50%",
                y: "-100%", // Anchor bottom
            }}
            onClick={onClick}
            // Idle Animation: Float up and down
            animate={{ y: ["-100%", "-110%"] }}
            transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 2,
                ease: "easeInOut",
                delay: randomDelay
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`View details for ${title}`}
            aria-expanded={isSelected}
        >
            {/* Selection Glow */}
            {isSelected && (
                <motion.div
                    layoutId="selection-ring"
                    className="absolute -bottom-2 w-16 h-4 bg-black/20 blur-md rounded-[100%]"
                />
            )}

            {/* Marker Icon - Bigger & Premium */}
            <div
                className={cn(
                    "relative w-16 h-16 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 border-4 border-white",
                    isSelected ? "scale-110" : "grayscale-[0.3] hover:grayscale-0",
                    "bg-gradient-to-br from-white to-neutral-100 ring-1 ring-black/5"
                )}
            >
                <span className="text-4xl filter drop-shadow-sm" role="img" aria-label={title}>
                    {icon}
                </span>

                {/* Category Badge on Icon */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px] border-2 border-white shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                </div>
            </div>

            {/* Label - Only show if selected or hovered (or always if sparse) */}
            <motion.div
                className={cn(
                    "mt-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/40 pointer-events-none transition-all duration-300",
                    isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                )}
            >
                <span className="text-sm font-bold text-neutral-800 whitespace-nowrap font-serif">
                    {title}
                </span>
            </motion.div>
        </motion.button>
    );
}
