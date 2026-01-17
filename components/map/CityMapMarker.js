
"use client";

import { motion, useTransform, useMotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import { useMapState } from "./MapCanvas";
import { cn } from "@/lib/utils";

// --- Predefined Map Structures (Clean, Isometric-ish, Professional) ---
const Structures = {
    Dome: (color) => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current drop-shadow-sm" style={{ color }}>
            {/* Simple Clean Semi-Circle Dome */}
            <path d="M2,18 L22,18 L22,20 L2,20 Z" fillOpacity="0.8" /> {/* Base */}
            <path d="M12,4 C17,4 21,12 21,18 L3,18 C3,12 7,4 12,4 Z" fillOpacity="0.9" /> {/* Dome */}
            <path d="M12,4 C14,4 15,10 15,18 L9,18 C9,10 10,4 12,4 Z" fill="white" fillOpacity="0.2" /> {/* Shine/Highlight */}
        </svg>
    ),
    Tent: (color) => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current drop-shadow-sm" style={{ color }}>
            {/* Clean Event Tent */}
            <path d="M12,3 L2,15 L2,20 L22,20 L22,15 L12,3 Z" fillOpacity="0.9" />
            <path d="M12,3 L12,20" stroke="white" strokeWidth="0.5" strokeOpacity="0.4" /> {/* Center Pole line */}
            <path d="M12,3 L7,15 L17,15 L12,3 Z" fill="white" fillOpacity="0.2" /> {/* Front Face */}
        </svg>
    ),
    Stage: (color) => (
        <svg viewBox="0 0 24 24" className="w-12 h-9 fill-current drop-shadow-sm" style={{ color }}>
            {/* Rectangular Stage Structure */}
            <rect x="2" y="10" width="20" height="8" rx="1" fillOpacity="0.9" />
            <path d="M4,10 L8,5 L16,5 L20,10" fillOpacity="0.6" /> {/* Roof/Truss */}
            <rect x="6" y="12" width="12" height="4" fill="white" fillOpacity="0.2" /> {/* Screen/Area */}
        </svg>
    ),
    Building: (color) => (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current drop-shadow-sm" style={{ color }}>
            {/* Minimalist Tower */}
            <path d="M6,22 L18,22 L18,6 L6,6 L6,22 Z" fillOpacity="0.9" />
            <path d="M6,6 L12,2 L18,6" fillOpacity="0.7" /> {/* Roof */}
            <rect x="8" y="9" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="13" y="9" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="8" y="14" width="3" height="3" fill="white" fillOpacity="0.4" />
            <rect x="13" y="14" width="3" height="3" fill="white" fillOpacity="0.4" />
        </svg>
    ),
    Entry: (color) => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current drop-shadow-sm" style={{ color }}>
            {/* Gate / Entry Archetype */}
            <path d="M4,20 L4,8 L12,4 L20,8 L20,20" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7,20 L7,12 Q12,10 17,12 L17,20" fillOpacity="0.3" />
            <text x="12" y="16" fontSize="5" textAnchor="middle" fill="white" fontWeight="bold">ENTRY</text>
        </svg>
    ),
    Exit: (color) => (
        <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current drop-shadow-sm" style={{ color: '#ef4444' }}>
            <path d="M4,20 L4,8 L12,4 L20,8 L20,20" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M7,20 L7,12 Q12,10 17,12 L17,20" fillOpacity="0.3" />
            <text x="12" y="16" fontSize="5" textAnchor="middle" fill="white" fontWeight="bold">EXIT</text>
        </svg>
    ),
    Medical: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <rect x="4" y="4" width="16" height="16" rx="2" fillOpacity="0.9" />
            <path d="M12,8 L12,16 M8,12 L16,12" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    Info: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <circle cx="12" cy="12" r="10" fillOpacity="0.9" />
            <path d="M12,16 L12,11 M12,8 L12,8.01" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    Parking: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <rect x="4" y="4" width="16" height="16" rx="2" fillOpacity="0.9" />
            <text x="12" y="15.5" fontSize="12" textAnchor="middle" fill="white" fontWeight="900" fontFamily="sans-serif">P</text>
        </svg>
    ),
    Restroom: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <rect x="4" y="4" width="16" height="16" rx="2" fillOpacity="0.9" />
            <circle cx="9" cy="9" r="1.5" fill="white" />
            <path d="M7.5,12 L10.5,12 L10.5,16 L7.5,16 Z" fill="white" />
            <circle cx="15" cy="9" r="1.5" fill="white" />
            <path d="M13.5,12 L16.5,12 L16.5,16 L13.5,16 Z" fill="white" />
            <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="0.5" strokeOpacity="0.5" />
        </svg>
    ),
    Shop: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <path d="M6,8 L18,8 L19,20 L5,20 Z" fillOpacity="0.9" />
            <path d="M9,10 Q9,4 12,4 Q15,4 15,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    Workshop: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <path d="M12,2 L14.5,4.5 L17,4 L17.5,6.5 L20,7 L19.5,9.5 L22,12 L19.5,14.5 L20,17 L17.5,17.5 L17,20 L14.5,19.5 L12,22 L9.5,19.5 L7,20 L6.5,17.5 L4,17 L4.5,14.5 L2,12 L4.5,9.5 L4,7 L6.5,6.5 L7,4 L9.5,4.5 Z" fillOpacity="0.9" />
            <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.3" />
        </svg>
    ),
    Cafe: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <path d="M5,8 L17,8 L16,18 L6,18 Z" fillOpacity="0.9" />
            <path d="M17,10 Q21,10 21,13 Q21,16 17,16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8,5 L8,7 M11,5 L11,7 M14,5 L14,7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    Security: (color) => (
        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current drop-shadow-sm" style={{ color }}>
            <path d="M12,2 L4,5 L4,11 Q4,17 12,22 Q20,17 20,11 L20,5 Z" fillOpacity="0.9" />
            <path d="M12,7 L12,15 M9,12 L15,12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    Theater: (color) => (
        <svg viewBox="0 0 24 24" className="w-10 h-9 fill-current drop-shadow-sm" style={{ color }}>
            {/* Minimalist Mask style */}
            <path d="M2,10 Q2,4 8,4 Q14,4 14,10 Q14,16 8,16 Q2,16 2,10 Z" fillOpacity="0.8" transform="translate(0, 0) rotate(-10 8 10)" />
            <path d="M10,10 Q10,4 16,4 Q22,4 22,10 Q22,16 16,16 Q10,16 10,10 Z" fillOpacity="0.6" transform="translate(0, 2) rotate(10 16 10)" />
            <circle cx="5" cy="8" r="1" fill="white" />
            <circle cx="11" cy="8" r="1" fill="white" />
            <circle cx="13" cy="10" r="1" fill="white" />
            <circle cx="19" cy="10" r="1" fill="white" />
        </svg>
    )
};

export default function CityMapMarker({ event, isSelected, onClick, draggable = false, onDragEnd, isViewed }) {
    const { position, title, color, category, icon, iconType } = event;
    const { scale } = useMapState();

    const markerScale = useTransform(scale, s => 2 / s);

    // Motion values to handle drag transforms and reset them on end
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    // Track where we grabbed the marker relative to its anchor point
    const grabOffset = useRef({ x: 0, y: 0 });

    // Choose structure based on category
    const StructureIcon = useMemo(() => {
        if (!category) return Structures.Building;
        const cat = category.toLowerCase();
        if (cat.includes("performance")) return Structures.Stage;
        if (cat.includes("wellness")) return Structures.Dome;
        if (cat.includes("exhibition")) return Structures.Dome;
        if (cat.includes("food")) return Structures.Tent;
        if (cat.includes("art")) return Structures.Dome;
        if (cat.includes("entry")) return Structures.Entry;
        if (cat.includes("exit")) return Structures.Exit;
        if (cat.includes("medical")) return Structures.Medical;
        if (cat.includes("info")) return Structures.Info;
        if (cat.includes("parking")) return Structures.Parking;
        if (cat.includes("restroom") || cat.includes("washroom")) return Structures.Restroom;
        if (cat.includes("shop") || cat.includes("market")) return Structures.Shop;
        if (cat.includes("workshop") || cat.includes("talk")) return Structures.Workshop;
        if (cat.includes("cafe") || cat.includes("coffee") || cat.includes("drink")) return Structures.Cafe;
        if (cat.includes("security") || cat.includes("safety")) return Structures.Security;
        if (cat.includes("theater") || cat.includes("cinema") || cat.includes("show")) return Structures.Theater;
        return Structures.Building;
    }, [category]);

    const handlePointerClick = (e) => {
        if (onClick) onClick();
    };

    // Determine color based on viewed status
    const markerColor = color || '#666'; // Green-500 if viewed

    return (
        <motion.div
            className={`absolute z-20 ${draggable ? 'cursor-move active:cursor-grabbing' : (event.openModal === false ? 'cursor-default' : 'cursor-pointer')}`}
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                x: dragX,
                y: dragY,
                zIndex: isSelected ? 100 : 10,
                // backgroundColor: "red",
                width: "10px",
                height: "10px"
            }}
            onClick={handlePointerClick}
            onPointerDown={(e) => {
                if (draggable) e.stopPropagation();
            }}
            // Drag Props
            drag={draggable}
            dragMomentum={false}
            dragElastic={0}
            onDragStart={(e, info) => {
                const container = e.target.closest('.relative.w-full.h-full.p-\\[20vmax\\]');
                if (!container) return;

                const rect = container.getBoundingClientRect();

                // Current pixel position of anchor relative to container
                const anchorX = (position.x / 100) * rect.width;
                const anchorY = (position.y / 100) * rect.height;

                // Store where we grabbed it
                grabOffset.current = {
                    x: info.point.x - (rect.left + anchorX),
                    y: info.point.y - (rect.top + anchorY)
                };
            }}
            onDragEnd={(e, info) => {
                if (!onDragEnd || !draggable) return;

                const container = e.target.closest('.relative.w-full.h-full.p-\\[20vmax\\]');
                if (!container) return;

                const rect = container.getBoundingClientRect();

                // Calculate where the anchor should be now
                const newAnchorPixelX = info.point.x - rect.left - grabOffset.current.x;
                const newAnchorPixelY = info.point.y - rect.top - grabOffset.current.y;

                const newX = Math.max(0, Math.min(100, parseFloat((newAnchorPixelX / rect.width * 100).toFixed(2))));
                const newY = Math.max(0, Math.min(100, parseFloat((newAnchorPixelY / rect.height * 100).toFixed(2))));

                onDragEnd({ x: newX, y: newY });

                // Reset motion transforms immediately
                dragX.set(0);
                dragY.set(0);
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >

            {/* 
                VISUAL WRAPPER 
                Handles scaling and anchor translation.
            */}
            <motion.div
                style={{ scale: markerScale }}
                animate={isSelected ? {
                    scale: [
                        markerScale.get(),
                        markerScale.get() * 1.05,
                        markerScale.get()
                    ]
                } : {
                    scale: markerScale.get()
                }}
                transition={isSelected ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
                className="relative -translate-x-1/2 -translate-y-full flex flex-col items-center justify-end pointer-events-none"
            >
                {/* 1. The Label Pill */}
                <motion.div
                    className={cn(
                        "relative mb-0 px-1 py-1.5 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center gap-2 w-max max-w-[80px] transition-all pointer-events-auto",
                        isSelected ? "ring-2 ring-[#FA5429] scale-105" : "opacity-95",
                        isViewed && !isSelected && "border-green-500/50 bg-green-50"
                    )}
                    initial={{ y: 5 }}
                    animate={{ y: 0 }}
                >
                    {
                        icon && iconType === 'emoji' &&
                        <span className="text-[5px] leading-none shrink-0" role="img" aria-label="icon">
                            {icon}
                        </span>
                    }
                    <span className={cn(
                        "text-[5px] font-bold font-sans tracking-wide camelcase text-center leading-tight break-words",
                        isViewed ? "text-green-700" : "text-gray-800"
                    )}>
                        {event.markerTitle || title}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-gray-200" />
                </motion.div>

                {/* 2. The Structure */}
                <div className="relative opacity-100 transition-transform hover:scale-105 pointer-events-auto">
                    {StructureIcon(markerColor)}
                </div>

                {/* 3. Shadow */}
                <div className="absolute -bottom-1 w-5 h-1 bg-black/10 rounded-[100%] z-0" />
            </motion.div>
        </motion.div>
    );
}
