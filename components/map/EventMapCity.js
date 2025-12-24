
"use client";

import { useState, useMemo } from "react";
import MapCanvas from "./MapCanvas";
import CityMapBackground from "./CityMapBackground";
import CityMapMarker from "./CityMapMarker";
import AnimatedPath from "./AnimatedPath";
import { useEventData } from "@/hooks/useEventData";
import { motion } from "framer-motion";

export default function EventMapCity({ onEventSelect }) {
    const { events, routes } = useEventData();
    const [selectedId, setSelectedId] = useState(null);

    const handlePointClick = (id) => {
        setSelectedId(id);
        const event = events.find((e) => e.id === id);
        if (onEventSelect) {
            onEventSelect(event);
        }
    };

    // Calculate City-Style Paths (Manhattan/Elbow Routing)
    const calculatedPaths = useMemo(() => {
        if (!routes || !events) return [];

        return routes.map(route => {
            const start = events.find(e => e.id === route.from);
            const end = events.find(e => e.id === route.to);

            if (!start || !end) return null;

            const p1 = start.position;
            const p2 = end.position;

            // Create an "L" shape or "Step" shape path to look like streets
            // If horizontal distance > vertical, move horizontal first, then vertical
            // To make it look like a specific "Route" we can just do simple Elbow:
            // Move X then Move Y

            const midX = p2.x; // Move all the way to target X
            const midY = p1.y; // Stay at start Y

            // Path: Start -> Corner -> End
            // Adding a small radius at the corner for smoothness?
            // Simple L-shape:
            return `M ${p1.x} ${p1.y} L ${midX} ${midY} L ${p2.x} ${p2.y}`;

            // Alternative: Midpoint Stepped (Z-shape)
            // const midX = (p1.x + p2.x) / 2;
            // return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
        }).filter(Boolean);
    }, [events, routes]);

    return (
        <MapCanvas>
            <CityMapBackground />

            {/* Roads Animation - now using Elbow paths */}
            <div className="opacity-60"> {/* Slightly fainter paths to blend with city */}
                <AnimatedPath
                    paths={calculatedPaths}
                />
            </div>

            {/* Render Event Points */}
            {events.map((event) => (
                <CityMapMarker
                    key={event.id}
                    event={event}
                    isSelected={selectedId === event.id}
                    onClick={() => handlePointClick(event.id)}
                />
            ))}

            {/* Animated Avatar */}
            <motion.div
                className="absolute z-30 pointer-events-none"
                initial={{ left: '50%', top: '90%' }}
                animate={{
                    left: selectedId ? `${events.find(e => e.id === selectedId)?.position.x}%` : '50%',
                    top: selectedId ? `${events.find(e => e.id === selectedId)?.position.y}%` : '90%'
                }}
                transition={{
                    type: "spring",
                    stiffness: 40,
                    damping: 25,
                    mass: 1,
                    restDelta: 0.001
                }}
            >
                <div className="relative -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
                    <span className="text-3xl filter drop-shadow-md">🚶</span>
                    <div className="absolute -top-4 whitespace-nowrap bg-black text-white text-[8px] px-1 rounded font-bold">YOU</div>
                </div>
            </motion.div>

        </MapCanvas>
    );
}
