
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

    // State to drive UI buttons (MotionValues don't trigger re-renders)
    const [zoomState, setZoomState] = useState({ canZoomIn: true, canZoomOut: false });

    useEffect(() => {
        // Subscribe to scale changes to update UI state
        const unsubscribe = scale.on("change", (latest) => {
            // Define limits with small epsilon for float comparison
            const isMin = latest <= minZoom + 0.01;
            // Limit max zoom to 2 steps (approx 2.5x base)
            const absoluteMax = minZoom * 2.5;
            const isMax = latest >= absoluteMax - 0.01;

            setZoomState({
                canZoomIn: !isMax,
                canZoomOut: !isMin
            });
        });
        return unsubscribe;
    }, [scale, minZoom]);

    // Update Max Zoom dynamically? Or just soft limit in handler?
    // We'll enforce soft limit in zoomIn/Out and wheel handler
    const safeZoomIn = () => {
        const absoluteMax = minZoom * 2.5;
        // Step size: ~50% increment
        const next = Math.min(scale.get() * 1.5, absoluteMax);
        scale.set(next);
    };

    const safeZoomOut = () => {
        // Step size: ~50% decrement
        const next = Math.max(scale.get() / 1.5, minZoom);
        scale.set(next);
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const current = scale.get();
            const absoluteMax = minZoom * 2.5;

            let next;
            if (e.ctrlKey || e.metaKey) {
                next = current - e.deltaY * 0.01;
            } else {
                next = current - e.deltaY * 0.001;
            }

            // Clamp
            next = Math.min(Math.max(next, minZoom), absoluteMax);
            scale.set(next);
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, [scale, minZoom]);

    return {
        x,
        y,
        scale: smoothScale,
        rawScale: scale,
        containerRef,
        minZoom,
        ...zoomState, // Expose canZoomIn, canZoomOut
        zoomIn: safeZoomIn,
        zoomOut: safeZoomOut
    };
}
