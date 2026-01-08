"use client";

import { useState, useMemo, useEffect } from "react";
import EventMapCity from "./EventMapCity";
import EventMapVenue from "./EventMapVenue";
import CustomMapExample from "./examples/CustomMapExample";
import MapCanvas from "./MapCanvas";
import AnimatedPath from "./AnimatedPath";
import CityMapMarker from "./CityMapMarker";
import BlurZone from "./BlurZone";
import { useEventData } from "@/hooks/useEventData";
import { useMapState } from "./MapCanvas";
import AreaMap from "./AreaMap";
import ExhibitionMap2 from "./ExhibitionMap2";
import WalkingMan from "./WalkingMan";
import { checkFirstTimeVisitor } from "@/app/actions/analytics";
import { useUserParams } from "@/hooks/useUserParams";

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
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [revealedZones, setRevealedZones] = useState(new Set());
    const userDetails = useUserParams();

    // Check First Time Visitor
    useEffect(() => {
        const checkStatus = async () => {
            if (mapConfig?.id && (userDetails?.userId || userDetails?.userEmail)) {
                const result = await checkFirstTimeVisitor(userDetails.userId, mapConfig.id, userDetails.userEmail);
                if (result.success) {
                    setIsFirstTime(result.isFirstTime);
                }
            }
        };
        checkStatus();
    }, [mapConfig?.id, userDetails?.userId, userDetails?.userEmail]);

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

    const handleReveal = (zoneId) => {
        setRevealedZones(prev => new Set(prev).add(zoneId));
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

    // 2. Render Custom SVG Map (Used for Exhibition/Area)
    if (mapConfig?.type === 'custom' || SelectedMap === 'custom' || mapConfig?.type === 'area' || SelectedMap === 'area') {
        const MapComponent = (mapConfig?.type === 'area' || SelectedMap === 'area') ? AreaMap : ExhibitionMap2;

        return (
            <MapCanvas controls={<ZoomControls />}>
                {/* Background - The custom SVG provided by user */}
                <MapComponent />

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

                {/* Blur Zones (Only if First Time & Not Revealed & configured) */}
                {isFirstTime && mapConfig?.blurZones?.map((zone) => (
                    <BlurZone
                        key={zone.id || Math.random()}
                        zone={zone}
                        onReveal={handleReveal}
                        isRevealed={revealedZones.has(zone.id)}
                    />
                ))}

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
