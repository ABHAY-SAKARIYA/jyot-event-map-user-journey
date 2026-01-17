
"use client";

import { motion } from "framer-motion";
import { useMapGestures } from "@/hooks/useMapGestures";
import { cn } from "@/lib/utils";
import { useState, useEffect, createContext, useContext } from "react";

// Create Context to share map state (like scale) with children markers
const MapContext = createContext({ scale: 1, zoomIn: () => { }, zoomOut: () => { }, canZoomIn: true, canZoomOut: false });

export const useMapState = () => useContext(MapContext);

export default function MapCanvas({ children, className, controls }) {
    const { x, y, scale, containerRef, zoomIn, zoomOut, canZoomIn, canZoomOut } = useMapGestures();
    const [constraints, setConstraints] = useState({ left: -1000, right: 1000, top: -1000, bottom: 1000 });

    // We need to pass the REAL numeric scale value to children, not just the motion value
    // However, for performance, passing the motion value is better if children use framer-motion
    // But if we want to switch classes or do logic, we need state.
    // For rendering resizing markers, we can pass the motion value and use style={{ scale: inverseScale }}

    useEffect(() => {
        // Calculate safe constraints based on viewport vs map content size
        const updateConstraints = () => {
            if (typeof window === 'undefined') return;

            const w = window.innerWidth;
            const h = window.innerHeight;
            // Larger constraints allow "overscroll" feeling so you never feel stuck
            setConstraints({
                left: -w * 5,
                right: w * 5,
                top: -h * 1,
                bottom: h * 1
            });
        };

        updateConstraints();
        window.addEventListener('resize', updateConstraints);
        return () => window.removeEventListener('resize', updateConstraints);
    }, []);

    return (
        <MapContext.Provider value={{ scale, zoomIn, zoomOut, canZoomIn, canZoomOut }}>
            <div
                ref={containerRef}
                className={cn("relative w-full h-screen overflow-hidden bg-white cursor-grab active:cursor-grabbing", className)}
            >
                <motion.div
                    className="absolute flex items-center justify-center w-[150vmax] h-[150vmax] origin-center -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                    style={{ x, y, scale }}
                    drag
                    dragConstraints={constraints}
                    dragElastic={0.2}
                    dragMomentum={true}
                    dragTransition={{ power: 0.2, timeConstant: 200 }}
                >
                    {/* The Map Content */}
                    <div className="relative w-full h-full p-[20vmax]">
                        {children}
                    </div>
                </motion.div>

                {/* Fixed Overlay Controls (Zoom etc) */}
                {controls}
            </div>
        </MapContext.Provider>
    );
}
