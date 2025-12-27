
"use client";

import { useState, useMemo } from "react";
import MapCanvas, { useMapState } from "./MapCanvas";
import CityMapBackground from "./CityMapBackground";
import CityMapMarker from "./CityMapMarker";
import AnimatedPath from "./AnimatedPath";
import { useEventData } from "@/hooks/useEventData";
import WalkingMan from "./WalkingMan";

// Helper component to access Map Context
function ZoomControls() {
    const { zoomIn, zoomOut, canZoomIn, canZoomOut } = useMapState();

    return (
        <div className="absolute bottom-24 right-4 flex flex-col gap-2 pointer-events-auto z-50">
            <button
                onClick={zoomIn}
                disabled={!canZoomIn}
                className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all border border-gray-100
                    ${!canZoomIn ? 'opacity-50 cursor-not-allowed blur-[0.5px]' : 'hover:bg-gray-50 active:scale-95'}
                `}
                aria-label="Zoom In"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <button
                onClick={zoomOut}
                disabled={!canZoomOut}
                className={`w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all border border-gray-100
                    ${!canZoomOut ? 'opacity-50 cursor-not-allowed blur-[0.5px]' : 'hover:bg-gray-50 active:scale-95'}
                `}
                aria-label="Zoom Out"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
}

export default function EventMapCity({ onEventSelect, events: propEvents, routes: propRoutes, config, draggable = false, onEventDragEnd, selectedId }) {
    const { events: hookEvents, routes: hookRoutes } = useEventData();
    // Use prop selectedId if provided, otherwise can use local if needed for admin but unified is better
    const events = propEvents || hookEvents;
    const routes = propRoutes || hookRoutes;

    const handlePointClick = (id) => {
        const event = events.find((e) => e.id === id);
        if (onEventSelect) {
            onEventSelect(event);
        }
    };

    // Calculate City-Style Paths
    const calculatedPaths = useMemo(() => {
        if (!routes || !events) return [];

        return routes.map(route => {
            const start = events.find(e => e.id === route.from);
            const end = events.find(e => e.id === route.to);

            if (!start || !end) return null;

            const p1 = start.position;
            const p2 = end.position;

            const midX = p2.x;
            const midY = p1.y;

            return `M ${p1.x} ${p1.y} L ${midX} ${midY} L ${p2.x} ${p2.y}`;
        }).filter(Boolean);
    }, [events, routes]);

    return (
        <MapCanvas controls={<ZoomControls />}>
            <CityMapBackground config={config} />

            {/* Roads Animation */}
            <div className="opacity-60">
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
                    draggable={draggable}
                    onDragEnd={(newPos) => onEventDragEnd?.(event.id, newPos)}
                />
            ))}

            {/* Animated Avatar */}
            <WalkingMan position={events.find(e => e.id === selectedId)?.position} />

        </MapCanvas>
    );
}
