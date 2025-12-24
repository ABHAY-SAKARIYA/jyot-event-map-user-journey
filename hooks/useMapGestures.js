"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const MIN_ZOOM = 1; // Was 0.5 - prevent zooming out too much to avoid "empty space"
const MAX_ZOOM = 4; // Allow deeper zoom for details

export function useMapGestures() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1.5); // Start zoomed in for immersion

    // Smooth spring physics for natural feel
    const smoothX = useSpring(x, { damping: 20, stiffness: 100 });
    const smoothY = useSpring(y, { damping: 20, stiffness: 100 });
    const smoothScale = useSpring(scale, { damping: 20, stiffness: 150 });

    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (e.ctrlKey || e.metaKey) { // Pinch gesture often sends Ctrl+Wheel
                e.preventDefault();
                const newScale = Math.min(Math.max(scale.get() - e.deltaY * 0.01, MIN_ZOOM), MAX_ZOOM);
                scale.set(newScale);
            } else {
                // Standard wheel to pan if we want, or just scroll to zoom? 
                // Prompt says: "Zoom in/out (pinch & scroll)"
                e.preventDefault();
                const newScale = Math.min(Math.max(scale.get() - e.deltaY * 0.001, MIN_ZOOM), MAX_ZOOM);
                scale.set(newScale);
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [scale]);

    return {
        x: smoothX,
        y: smoothY,
        scale: smoothScale,
        containerRef,
        // Methods to manually control map if needed
        setCenter: (newX, newY) => {
            x.set(newX);
            y.set(newY);
        },
        zoomIn: () => scale.set(Math.min(scale.get() * 1.2, MAX_ZOOM)),
        zoomOut: () => scale.set(Math.max(scale.get() / 1.2, MIN_ZOOM))
    };
}
