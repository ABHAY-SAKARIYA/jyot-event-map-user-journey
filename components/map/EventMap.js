"use client";

import { useState, useMemo } from "react";
import MapCanvas from "./MapCanvas";
import MapBackground from "./MapBackground";
import { motion } from "framer-motion";
import EventPoint from "./EventPoint";
import AnimatedPath from "./AnimatedPath";
import { useEventData } from "@/hooks/useEventData";

export default function EventMap({ onEventSelect }) {
    const { events, routes } = useEventData();
    const [selectedId, setSelectedId] = useState(null);

    const handlePointClick = (id) => {
        setSelectedId(id);
        const event = events.find((e) => e.id === id);
        if (onEventSelect) {
            onEventSelect(event);
        }
    };

    // Calculate dynamic paths based on event positions
    const calculatedPaths = useMemo(() => {
        if (!routes || !events) return [];

        return routes.map(route => {
            const start = events.find(e => e.id === route.from);
            const end = events.find(e => e.id === route.to);

            if (!start || !end) return null;

            const p1 = start.position;
            const p2 = end.position;

            // Calculate a control point for a quadratic curve
            // Simple logic: Midpoint + some perpendicular offset to make it "organic"
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;

            // Offset logic: Fixed offset or pseudo-random based on coords to be deterministic
            // We'll just curve slightly "up" or "down" based on X direction to keep it consistent
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            // Perpendicular vector (-dy, dx)
            // Normalize roughly implies dividing by length, but we can just take a fraction
            const offset = 10; // 10% curve magnitude

            // Simple curvature: if going right, curve down; if left, curve up?
            // Let's just do a fixed curve for now to keep it valid SVG

            return `M ${p1.x} ${p1.y} Q ${mx} ${my - offset} ${p2.x} ${p2.y}`;
        }).filter(Boolean);
    }, [events, routes]);

    return (
        <MapCanvas>
            <MapBackground />

            {/* Dynamic Organic Paths connecting the events */}
            <AnimatedPath
                paths={calculatedPaths}
            />

            {/* Entry Gate */}
            <div className="absolute text-center transform -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '90%' }}>
                <span className="text-2xl">⛩️</span>
                <div className="text-[10px] font-bold bg-white/80 px-1 rounded shadow-sm mt-1">ENTRY</div>
            </div>

            {/* Exit Gate */}
            <div className="absolute text-center transform -translate-x-1/2 -translate-y-1/2" style={{ left: '50%', top: '10%' }}>
                <span className="text-2xl">⛩️</span>
                <div className="text-[10px] font-bold bg-white/80 px-1 rounded shadow-sm mt-1">EXIT</div>
            </div>

            {/* Render Event Points */}
            {events.map((event) => (
                <EventPoint
                    key={event.id}
                    event={event}
                    isSelected={selectedId === event.id}
                    onClick={() => handlePointClick(event.id)}
                />
            ))}

            {/* Animated Avatar - The Small Person */}
            <motion.div
                className="absolute z-20 pointer-events-none"
                initial={{ left: '50%', top: '90%' }} // Start at Entry
                animate={{
                    left: selectedId ? `${events.find(e => e.id === selectedId)?.position.x}%` : '50%',
                    top: selectedId ? `${events.find(e => e.id === selectedId)?.position.y}%` : '90%'
                }}
                transition={{
                    type: "spring",
                    stiffness: 50,
                    damping: 20,
                    mass: 1.2,
                    restDelta: 0.001
                }}
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                    {/* Walking Person Emoji or Icon */}
                    <span className="text-2xl filter drop-shadow-md animate-bounce">🚶</span>
                    {/* Name Tag */}
                    <div className="absolute -top-4 whitespace-nowrap bg-black text-white text-[8px] px-1 rounded font-bold">YOU</div>
                </div>
            </motion.div>
        </MapCanvas>
    );
}
