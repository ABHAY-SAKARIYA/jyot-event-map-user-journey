"use client";

import { motion } from "framer-motion";

export default function AnimatedPath({ paths }) {
    // paths: Array of SVG path 'd' strings
    // e.g. ["M 10 10 L 50 50", "M 20 20 Q 40 10 60 20"]

    if (!paths || paths.length === 0) return null;

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {paths.map((d, i) => (
                <g key={i}>
                    {/* Road Outline/Glow (Subtle shadow) */}
                    <motion.path
                        d={d}
                        fill="none"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="2" // Slightly wider than the road for outline
                        strokeLinecap="round"
                    />

                    {/* Main Road (Solid White & Wide) */}
                    <motion.path
                        d={d}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5" // Wide "Road of India" style
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", delay: i * 0.1 }}
                        className="drop-shadow-sm"
                    />
                </g>
            ))}

            <defs>
                <linearGradient id="gradient-path" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
        </svg>
    );
}
