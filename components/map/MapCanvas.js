"use client";

import { motion } from "framer-motion";
import { useMapGestures } from "@/hooks/useMapGestures";
import { cn } from "@/lib/utils";

export default function MapCanvas({ children, className }) {
    const { x, y, scale, containerRef } = useMapGestures();

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900 cursor-grab active:cursor-grabbing", className)}
        >
            <motion.div
                className="absolute flex items-center justify-center w-[150vw] h-[150vw] origin-center" // Smaller canvas, more constrained
                style={{ x, y, scale }}
                drag
                dragConstraints={{
                    left: -window.innerWidth / 2,
                    right: window.innerWidth / 2,
                    top: -window.innerHeight / 2,
                    bottom: window.innerHeight / 2
                }}
                dragElastic={0.2} // Bouncy edges
                dragMomentum={true}
            >
                {/* The Island / Map Content */}
                <div className="relative w-[100vmax] h-[100vmax] md:w-[60vw] md:h-[60vw]">
                    {children}
                </div>
            </motion.div>

            {/* Optional: Zoom Controls Overlay */}
            <div className="absolute bottom-12 right-4 flex flex-col gap-2 z-50">
                {/* We can add buttons here later */}
            </div>
        </div>
    );
}
