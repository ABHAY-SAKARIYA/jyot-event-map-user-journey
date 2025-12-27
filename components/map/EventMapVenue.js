"use client";

import { useState, useMemo } from "react";
import MapCanvas, { useMapState } from "./MapCanvas";
import CustomSvgBackground from "./CustomSvgBackground";
import CityMapMarker from "./CityMapMarker";
import AnimatedPath from "./AnimatedPath";
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

/**
 * EventMapVenue - Venue/indoor floor plan style map
 */
export default function EventMapVenue({ onEventSelect, events, routes, draggable = false, onEventDragEnd, selectedId }) {
    const handlePointClick = (id) => {
        const event = events?.find((e) => e.id === id);
        if (onEventSelect && event) {
            onEventSelect(event);
        }
    };

    // Calculate paths for venue
    const calculatedPaths = useMemo(() => {
        if (!routes || !events) return [];

        return routes.map(route => {
            const start = events.find(e => e.id === route.from);
            const end = events.find(e => e.id === route.to);

            if (!start || !end) return null;

            const p1 = start.position;
            const p2 = end.position;

            // Simple straight line for venue
            return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
        }).filter(Boolean);
    }, [events, routes]);

    return (
        <MapCanvas controls={<ZoomControls />}>
            {/* Venue Background */}
            <CustomSvgBackground
                viewBox="0 0 100 100"
                backgroundColor="#ffffff"
            >
                {/* Floor plan background */}
                <rect width="100" height="100" fill="#fafafa" />

                {/* Grid pattern */}
                <defs>
                    <pattern id="venue-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#venue-grid)" />

                {/* Main hall */}
                <rect x="10" y="20" width="40" height="60" fill="#f5f5f5" stroke="#d0d0d0" strokeWidth="0.5" rx="1" />

                {/* North wing */}
                <rect x="55" y="10" width="35" height="30" fill="#e8f4f8" stroke="#b0d4e3" strokeWidth="0.5" rx="1" />

                {/* South wing */}
                <rect x="55" y="45" width="35" height="35" fill="#fff4e6" stroke="#f0c674" strokeWidth="0.5" rx="1" />

                {/* Corridor */}
                <rect x="50" y="40" width="5" height="10" fill="#e0e0e0" stroke="#c0c0c0" strokeWidth="0.3" />
            </CustomSvgBackground>

            {/* Routes */}
            <div className="opacity-60">
                <AnimatedPath
                    paths={calculatedPaths}
                />
            </div>

            {/* Render Event Points */}
            {events?.map((event) => (
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
            <WalkingMan position={events?.find(e => e.id === selectedId)?.position} />
        </MapCanvas>
    );
}
