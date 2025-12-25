
"use client";

import { useState, useMemo } from "react";
import MapCanvas, { useMapState } from "./MapCanvas";
import CityMapBackground from "./CityMapBackground";
import CityMapMarker from "./CityMapMarker";
import AnimatedPath from "./AnimatedPath";
import { useEventData } from "@/hooks/useEventData";
import { motion } from "framer-motion";

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

export default function EventMapCity({ onEventSelect, events: propEvents, routes: propRoutes, config }) {
    const { events: hookEvents, routes: hookRoutes } = useEventData();
    const [selectedId, setSelectedId] = useState(null);

    const events = propEvents || hookEvents;
    const routes = propRoutes || hookRoutes;

    const handlePointClick = (id) => {
        setSelectedId(id);
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

            {/* Zoom Controls Overlay - Rendered AFTER MapCanvas content? No context won't be available outside. 
                Wait, MapCanvas renders children INSIDE the motion div which moves.
                Use controls INSIDE MapCanvas?
                Actually Context is available to children. But if we put absolute div here inside MapCanvas children, it will SCALE with the map content!
                
                FIX: MapCanvas needs to render "Overlay" slots or we need to put the controls INSIDE MapCanvas but outside the Scaled Content.
                The current MapCanvas implementation:
                <MapContext.Provider>
                  <div className="relative w-full h-full ... overflow-hidden">
                     <motion.div ...scale...>
                       {children}   <-- This is where we are now.
                     </motion.div>
                  </div>
                </MapContext.Provider>

                If we render ZoomControls here as a child, it will be inside the motion.div and will move/scale.
                
                Correction: We must modify MapCanvas logic or pass a "Controls" prop?
                Or simpler: Place ZoomControls as a sibling of MapCanvas? But then it can't access Context provided BY MapCanvas.

                Solution: Modify MapCanvas to accept a `controls` prop or render children slightly differently?
                OR: Just accept that for now, I need to modify MapCanvas to render {children} inside the scaled area, but maybe allow an "Overlay" child?
                
                Alternate Solution: Move the Context Provider OUTSIDE the MapCanvas inner structure?
                No, MapCanvas *is* the provider.
                
                Let's Modify MapCanvas to properly support fixed overlays.
            */}

        </MapCanvas>
    );
}
