"use client";

import { useState, useMemo } from "react";
import EventMapCity from "./EventMapCity";
import EventMapVenue from "./EventMapVenue";
import CustomMapExample from "./examples/CustomMapExample";
import MapCanvas from "./MapCanvas";
import AnimatedPath from "./AnimatedPath";
import CityMapMarker from "./CityMapMarker";
import { useEventData } from "@/hooks/useEventData";
import { useMapState } from "./MapCanvas";
import AreaMap from "./AreaMap";
import ExhibitionMap2 from "./ExhibitionMap2";
import WalkingMan from "./WalkingMan";

// Shared Zoom Controls component
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

export default function EventMap({ onEventSelect, SelectedMap, selectMapId, completedIds = [] }) {
    const { events, routes, mapConfig, config, loading } = useEventData(selectMapId);
    const [selectedId, setSelectedId] = useState(null);

    const handlePointClick = (event) => {
        if (event.onClickType === 'link' && event.onClick) {
            window.open(event.onClick, "_self");
            return;
        }

        if (event.onClickType === 'action' && event.onClick) {
            console.log("Triggering custom action:", event.onClick);
            // Action framework can be integrated here
        }

        setSelectedId(event.id);

        if (event.openModal !== false && onEventSelect) {
            onEventSelect(event);
        }
    };

    if (loading) return null; // Parent handles loading screen

    // 1. Render Specific Components if specified
    if (mapConfig?.type === 'city' || SelectedMap === 'city') {
        return <EventMapCity
            onEventSelect={handlePointClick}
            events={events}
            routes={routes}
            config={config}
            selectedId={selectedId}
        />;
    }

    if (mapConfig?.type === 'venue' || SelectedMap === 'venue') {
        return <EventMapVenue
            onEventSelect={handlePointClick}
            events={events}
            routes={routes}
            config={config}
            selectedId={selectedId}
        />;
    }

    // 2. Render Custom SVG Map
    if (mapConfig?.type === 'custom' || SelectedMap === 'custom') {
        // Here we could dynamically load based on mapConfig.svgComponent
        // For now, we'll use the CustomMapExample or a generic one
        return (
            <MapCanvas controls={<ZoomControls />}>
                {/* Background - The custom SVG provided by user */}
                {/* <CustomMapExample /> */}
                <ExhibitionMap2 />

                {/* Routes */}
                <div className="opacity-60">
                    <AnimatedPath
                        paths={routes.map(r => {
                            const start = events.find(e => e.id === r.from);
                            const end = events.find(e => e.id === r.to);
                            if (!start || !end) return null;
                            return `M ${start.position.x} ${start.position.y} L ${end.position.x} ${end.position.y}`;
                        }).filter(Boolean)}
                    />
                </div>

                {/* Render Event Points */}
                {events.map((event) => (
                    <CityMapMarker
                        key={event.id}
                        event={event}
                        isSelected={selectedId === event.id}
                        onClick={() => handlePointClick(event)}
                        isViewed={completedIds?.includes(event.id)}
                    />
                ))}

                <WalkingMan position={events.find(e => e.id === selectedId)?.position} />
            </MapCanvas>
        );
    }
    if (mapConfig?.type === 'area' || SelectedMap === 'area') {
        // Here we could dynamically load based on mapConfig.svgComponent
        // For now, we'll use the CustomMapExample or a generic one
        return (
            <MapCanvas controls={<ZoomControls />}>
                {/* Background - The custom SVG provided by user */}
                <AreaMap />

                {/* Routes */}
                <div className="opacity-60">
                    <AnimatedPath
                        paths={routes.map(r => {
                            const start = events.find(e => e.id === r.from);
                            const end = events.find(e => e.id === r.to);
                            if (!start || !end) return null;
                            return `M ${start.position.x} ${start.position.y} L ${end.position.x} ${end.position.y}`;
                        }).filter(Boolean)}
                    />
                </div>

                {/* Render Event Points */}
                {events.map((event) => (
                    <CityMapMarker
                        key={event.id}
                        event={event}
                        isSelected={selectedId === event.id}
                        onClick={() => handlePointClick(event)}
                        isViewed={completedIds?.includes(event.id)}
                    />
                ))}

                <WalkingMan position={events.find(e => e.id === selectedId)?.position} />
            </MapCanvas>
        );
    }

    return <div>No Map Selected</div>;
}
