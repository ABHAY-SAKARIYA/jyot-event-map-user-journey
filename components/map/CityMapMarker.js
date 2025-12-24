
"use client";

import { motion, useTransform } from "framer-motion";
import { useMemo } from "react";
import { useMapState } from "./MapCanvas"; // Import the hook to get scale

export default function CityMapMarker({ event, isSelected, onClick }) {
    const { position, title, color, category, status } = event;
    const { scale } = useMapState();

    // Verify scale exists, default to 1 if not (e.g. if rendered outside context)
    // Motion value transform: as map scale increases (zoom in), marker scale decreases relatively
    // We want the marker to stay ROUGHLY the same physical size on screen, or at least not get tiny.
    // So we scale the marker by 1 / mapScale.
    // However, we might want to clamp it so it doesn't get HUGE when zoomed way out.
    // Let's settle on a "Scale Factor" that boosts it when zoomed out.

    // Logic: 
    // At scale 0.6 (zoomed out): we want marker to be scale ~1.6 (so 0.6 * 1.6 ~= 1)
    // At scale 2.0 (zoomed in): we want marker to be scale ~0.8 (so they don't cover everything)

    const markerScale = useTransform(scale, s => {
        // Base size logic: 
        // If s < 0.8 (zoomed out), return 1 / s (keep constant size)
        // If s > 1 (zoomed in), return 1 / s (keep constant size but let it get slightly smaller to show precision) or just 1?
        // User wants: "while zoomed out the icons pills should be enlarged"
        const inverse = 1 / s;
        return Math.max(inverse, 1); // Never get smaller than 1x relative to map coordinate space? 
        // Actually, if we just use inverse, it stays constant screen size.
        // Let's try pure inverse for "Constant Screen Size" feel.
    });

    // Map category to short label
    const shortLabel = useMemo(() => {
        if (!category) return "Event";
        if (category.includes("Food")) return "Food";
        if (category.includes("Wellness")) return "Zen";
        if (category.includes("Art")) return "Art";
        if (category.includes("Performance")) return "Live";
        return category.slice(0, 4);
    }, [category]);

    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                scale: markerScale, // Apply the dynamic scale
                originY: 1 // Scale from bottom so pin point stays in place
            }}
            onClick={onClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.2, zIndex: 50 }} // Hover override (might conflict with style scale, but motion handles it nicely usually)
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* The Speech Bubble */}
            <div className={`
                relative px-3 py-2 bg-white rounded-2xl shadow-lg border border-gray-100/50 flex flex-col items-center justify-center min-w-[60px]
                ${isSelected ? 'ring-2 ring-black z-20' : ''}
            `}>
                <span className="text-sm font-bold text-gray-900">{shortLabel}</span>
                {status && (
                    <span className="text-[9px] text-gray-400 uppercase tracking-tighter">{status}</span>
                )}

                {/* The little pointer/triangle at the bottom */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>

            {/* The Dot on the map */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: isSelected ? 'black' : (color || '#4ECDC4') }}
                />
            </div>

        </motion.div>
    );
}
