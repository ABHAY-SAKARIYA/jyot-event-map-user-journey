
"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Default fallbacks
const DEFAULT_MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;

export function useMapGestures() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(0.6); // Default to desktop scale initially to avoid hydration mismatch if possible, or handle via effect

    // We need state to track the "dynamic" min zoom based on device
    const [minZoom, setMinZoom] = useState(DEFAULT_MIN_ZOOM);

    const smoothScale = useSpring(scale, { damping: 20, stiffness: 150 });
    const containerRef = useRef(null);

    useEffect(() => {
        // Responsive Logic
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            const targetBaseScale = isMobile ? 0.8 : 0.6;

            // Set the minimum zoom limit
            setMinZoom(targetBaseScale);

            // Access raw value to check if we should reset/init
            // If scale is at default 1 (or 0.6 previous default), snap to new base
            // Or just verify we are within bounds
            const currentScale = scale.get();
            if (currentScale < targetBaseScale) {
                scale.set(targetBaseScale);
            }
        };

        // Run once on mount
        handleResize();
        // And on resize
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [scale]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const newScale = Math.min(Math.max(scale.get() - e.deltaY * 0.01, minZoom), MAX_ZOOM);
                scale.set(newScale);
            } else {
                e.preventDefault();
                const newScale = Math.min(Math.max(scale.get() - e.deltaY * 0.001, minZoom), MAX_ZOOM);
                scale.set(newScale);
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        // Touch pinch-zoom logic would ideally go here too for full mobile support

        return () => container.removeEventListener("wheel", handleWheel);
    }, [scale, minZoom]);

    return {
        x,
        y,
        scale: smoothScale, // Return the spring value for smooth rendering
        rawScale: scale, // Return raw value if needed for calculations
        containerRef,
        minZoom,
        // Methods
        zoomIn: () => scale.set(Math.min(scale.get() * 1.2, MAX_ZOOM)),
        zoomOut: () => scale.set(Math.max(scale.get() / 1.2, minZoom))
    };
}
