
"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Default fallbacks
const DEFAULT_MIN_ZOOM = 2;
const MAX_ZOOM = 8;

export function useMapGestures() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(2); // Default to desktop scale initially to avoid hydration mismatch if possible, or handle via effect

    // We need state to track the "dynamic" min zoom based on device
    const [minZoom, setMinZoom] = useState(DEFAULT_MIN_ZOOM);

    const smoothScale = useSpring(scale, { damping: 20, stiffness: 150 });
    const containerRef = useRef(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Responsive Logic
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            const targetBaseScale = isMobile ? 3 : 1.9;

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

    // Dedicated effect for initial alignment
    useEffect(() => {
        const alignMap = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const maxDim = Math.max(w, h);
            const currentS = scale.get();

            // Map content is approx 110vmax (150vmax container - 20vmax padding * 2)
            const contentSize = 1.1 * maxDim * currentS;
            const contentHalfSize = contentSize / 2;

            // Inner SVG padding correction (approx 20px on 1000px image ~ 2%)
            const INNER_PADDING_RATIO = 0.0192;
            const paddingOffset = contentSize * INNER_PADDING_RATIO;

            // Align Image Bottom-Left to Screen Bottom-Left
            // X: Shift Right to bring Left Edge to Viewport Left
            // Then Shift Left by paddingOffset
            // leftOffset is used to move the image to the left by a certain amount
            const leftOffset = contentSize * 0.2;
            const targetX = (contentHalfSize - w / 2) + leftOffset;

            // Y: Shift Down to bring Bottom Edge to Viewport Bottom
            // Then Shift Up (wait, padding is inside, so Image Bottom is UP from Container Bottom)
            // Container Bottom is at +contentHalfSize.
            // Screen Bottom is at +h/2.
            // We want Container Bottom to be at +h/2.
            // Shift required: h/2 - contentHalfSize. (Negative shift = UP).
            // Image Bottom is `paddingOffset` ABOVE Container Bottom.
            // So we need Container Bottom to be `paddingOffset` BELOW Screen Bottom.
            // Container Bottom Target = h/2 + paddingOffset.
            // Shift = (h/2 + paddingOffset) - contentHalfSize.
            const targetY = (h / 1.5 + paddingOffset) - contentHalfSize;

            x.set(targetX);
            y.set(targetY);
        };

        // Small timeout to ensure layout and scale are stable
        const timer = setTimeout(alignMap, 50);
        return () => clearTimeout(timer);
    }, []); // Run once on mount

    // State to drive UI buttons (MotionValues don't trigger re-renders)
    const [zoomState, setZoomState] = useState({ canZoomIn: true, canZoomOut: false });

    useEffect(() => {
        // Subscribe to scale changes to update UI state
        const unsubscribe = scale.on("change", (latest) => {
            // Define limits with small epsilon for float comparison
            const isMin = latest <= minZoom + 0.01;
            // Limit max zoom to 2 steps (approx 2.5x base)
            const absoluteMax = minZoom * 1.5;
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
        const absoluteMax = minZoom * 1.5;
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
            const absoluteMax = minZoom * 1.5;

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
