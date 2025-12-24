
"use client";

import { motion, useTransform } from "framer-motion";
import { useMemo } from "react";
import { useMapState } from "./MapCanvas";

// --- Predefined Map Structures (Clean, Isometric-ish, Professional) ---
const Structures = {
    Dome: (color) => (
        <svg viewBox="0 0 24 24" className="w-16 h-16 fill-current drop-shadow-sm" style={{ color }}>
            {/* Simple Clean Semi-Circle Dome */}
            <path d="M2,18 L22,18 L22,20 L2,20 Z" fillOpacity="0.8" /> {/* Base */}
            <path d="M12,4 C17,4 21,12 21,18 L3,18 C3,12 7,4 12,4 Z" fillOpacity="0.9" /> {/* Dome */}
            <path d="M12,4 C14,4 15,10 15,18 L9,18 C9,10 10,4 12,4 Z" fill="white" fillOpacity="0.2" /> {/* Shine/Highlight */}
        </svg>
    ),
    Tent: (color) => (
        <svg viewBox="0 0 24 24" className="w-16 h-16 fill-current drop-shadow-sm" style={{ color }}>
            {/* Clean Event Tent */}
            <path d="M12,3 L2,15 L2,20 L22,20 L22,15 L12,3 Z" fillOpacity="0.9" />
            <path d="M12,3 L12,20" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" /> {/* Center Pole line */}
            <path d="M12,3 L7,15 L17,15 L12,3 Z" fill="white" fillOpacity="0.2" /> {/* Front Face */}
        </svg>
    ),
    Stage: (color) => (
        <svg viewBox="0 0 24 24" className="w-20 h-14 fill-current drop-shadow-sm" style={{ color }}>
            {/* Rectangular Stage Structure */}
            <rect x="2" y="10" width="20" height="8" rx="1" fillOpacity="0.9" />
            <path d="M4,10 L8,5 L16,5 L20,10" fillOpacity="0.6" /> {/* Roof/Truss */}
            <rect x="6" y="12" width="12" height="4" fill="white" fillOpacity="0.2" /> {/* Screen/Area */}
        </svg>
    ),
    Building: (color) => (
        <svg viewBox="0 0 24 24" className="w-12 h-16 fill-current drop-shadow-sm" style={{ color }}>
            {/* Minimalist Tower */}
            <path d="M6,22 L18,22 L18,6 L6,6 L6,22 Z" fillOpacity="0.9" />
            <path d="M6,6 L12,2 L18,6" fillOpacity="0.7" /> {/* Roof */}
            <rect x="8" y="9" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="13" y="9" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="8" y="14" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="13" y="14" width="3" height="3" fill="white" fillOpacity="0.4" />
        </svg>
    )
};

export default function CityMapMarker({ event, isSelected, onClick }) {
    const { position, title, color, category, icon, iconType } = event;
    const { scale } = useMapState();

    const markerScale = useTransform(scale, s => Math.max(1 / s, 1));

    // Choose structure based on category
    const StructureIcon = useMemo(() => {
        if (!category) return Structures.Building;
        if (category.includes("Performance")) return Structures.Stage;
        if (category.includes("Wellness")) return Structures.Dome;
        if (category.includes("Food")) return Structures.Tent;
        if (category.includes("Art")) return Structures.Dome;
        return Structures.Building;
    }, [category]);

    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group flex flex-col items-center justify-end"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                scale: markerScale,
                originY: 1,
                zIndex: isSelected ? 100 : 10
            }}
            onClick={onClick}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            // whileHover={{ scale: 1.1, zIndex: 110 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* 1. The Label Pill - Floats ABOVE the structure (no overlap) */}
            <motion.div
                className={`
                    relative mb-1 px-3 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200 
                    flex items-center gap-2 min-w-max transition-all
                    ${isSelected ? 'ring-2 ring-black scale-105' : 'opacity-95'}
                `}
                // Initial float animation
                initial={{ y: 5 }}
                animate={{ y: 0 }}
            >
                {/* Icon */}
                <span className="text-sm leading-none" role="img" aria-label="icon">
                    {iconType === 'emoji' ? icon : '📍'}
                </span>

                {/* Title - No truncate, let it fit naturally */}
                <span className="text-[10px] font-bold text-gray-800 font-sans tracking-wide uppercase">
                    {title}
                </span>

                {/* Little pointer triangle pointing down to structure */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-gray-200" />
            </motion.div>

            {/* 2. The Structure (Visual Base) - Fully Visible */}
            {/* Removed drop-shadow-md for performance */}
            <div className="relative opacity-100 transition-transform group-hover:scale-105">
                {/* Render the specific structure graphic */}
                {StructureIcon(color || '#666')}
            </div>

            {/* 3. Shadow/Anchor on the ground - Removed Blur for performance */}
            <div className="absolute -bottom-1 w-8 h-2 bg-black/10 rounded-[100%] z-0" />

        </motion.div>
    );
}
