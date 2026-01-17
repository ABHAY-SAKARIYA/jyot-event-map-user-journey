
"use client";

import { useState, useEffect } from "react";
import EventMapCity from "@/components/map/EventMapCity";
import EventMapVenue from "@/components/map/EventMapVenue";
import CustomMapExample from "@/components/map/examples/CustomMapExample";
import MapCanvas from "@/components/map/MapCanvas";
import AnimatedPath from "@/components/map/AnimatedPath";
import CityMapMarker from "@/components/map/CityMapMarker";
import { updateEvents, updateRoutes, updateMapConfig, updateActiveMap, getMapConfiguration, updateBlurZones, updateCompletionMessage } from "@/app/actions/admin";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import AreaMap from "@/components/map/AreaMap";
import ExhibitionMap2 from "@/components/map/ExhibitionMap2";
import WalkingMan from "@/components/map/WalkingMan";
import BlurZone from "@/components/map/BlurZone";

export default function AdminDashboardClient({ initialRegistry }) {
    const [activeTab, setActiveTab] = useState("maps"); // maps | config | events | routes
    const [isSaving, setIsSaving] = useState(false);
    const [registry, setRegistry] = useState(initialRegistry);
    const [selectedMapId, setSelectedMapId] = useState(initialRegistry?.activeMapId);

    // Local State for editing current map data
    const [config, setConfig] = useState(null);
    const [events, setEvents] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [currentMapConfig, setCurrentMapConfig] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    // Ensure routes have IDs for the new optimized backend
    const ensureRouteIds = (routesList) => {
        return routesList.map(route => ({
            ...route,
            id: route.id || `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
    };

    // Load map data when selection changes
    useEffect(() => {
        if (selectedMapId) {
            loadMapData(selectedMapId);
        }
    }, [selectedMapId]);

    const loadMapData = async (mapId) => {
        const result = await getMapConfiguration(mapId);
        if (result.success) {
            setCurrentMapConfig(result.data.mapConfig);
            setEvents(result.data.events || []);
            setRoutes(ensureRouteIds(result.data.routes || []));
            setConfig(result.data.config || {});
        }
    };

    // Universal Save Handler - Save current map data
    const handleSave = async () => {
        if (!currentMapConfig) return;

        setIsSaving(true);
        try {
            const mapId = currentMapConfig.id;
            console.log("Saving blur zones:", currentMapConfig.blurZones);
            const res1 = await updateMapConfig(mapId, config);
            const res2 = await updateEvents(mapId, events);
            const res3 = await updateRoutes(mapId, ensureRouteIds(routes));
            const res4 = await updateBlurZones(mapId, currentMapConfig.blurZones || []);
            const res5 = await updateCompletionMessage(mapId, currentMapConfig.completionMessage);
            console.log("Blur zones save result:", res4);

            if (res1.success && res2.success && res3.success && res4.success && res5.success) {
                alert("All changes saved successfully to MongoDB (Optimized)!");
            } else {
                alert("Error saving some data. Check console.");
                console.error("Save results:", { res1, res2, res3, res4, res5 });
            }
        } catch (e) {
            alert("Error saving: " + e.message);
            console.error("Save error:", e);
        }
        setIsSaving(false);
    };

    const handleEventDragEnd = (eventId, newPosition) => {
        setEvents(prev => prev.map(event =>
            event.id === eventId
                ? { ...event, position: newPosition }
                : event
        ));
    };

    const handleApplyMap = async () => {
        if (!selectedMapId || selectedMapId === registry?.activeMapId) return;

        const result = await updateActiveMap(selectedMapId);
        if (result.success) {
            setRegistry(result.data);
            alert("Active map updated! Refresh the main page to see changes.");
        }
    };

    return (
        <div className="flex h-screen w-full bg-neutral-100 overflow-hidden">
            {/* Sidebar / Editor Pane */}
            <div className="w-1/2 md:w-1/3 flex flex-col border-r bg-white shadow-xl z-10">
                {/* Header */}
                <div className="p-4 border-b bg-white flex justify-between items-center">
                    <h2 className="font-bold text-lg">Map Admin</h2>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || activeTab === "maps"}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50">
                    {["maps", "config", "events", "routes", "blur"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors capitalized
                                ${activeTab === tab ? 'border-black text-black bg-white' : 'border-transparent text-gray-500 hover:text-gray-800'}
                            `}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {activeTab === "maps" && (
                        <MapSelector
                            registry={registry}
                            selectedMapId={selectedMapId}
                            onSelectMap={setSelectedMapId}
                            onApply={handleApplyMap}
                        />
                    )}

                    {activeTab === "config" && config && (
                        <ConfigEditor
                            config={config}
                            onChange={setConfig}
                            completionMessage={currentMapConfig?.completionMessage || ""}
                            onMessageChange={(msg) => setCurrentMapConfig(prev => ({ ...prev, completionMessage: msg }))}
                        />
                    )}

                    {activeTab === "events" && (
                        <EventsEditor events={events} onChange={setEvents} />
                    )}

                    {activeTab === "routes" && (
                        <RoutesEditor routes={routes} events={events} onChange={(newRoutes) => setRoutes(ensureRouteIds(newRoutes))} />
                    )}

                    {activeTab === "blur" && (
                        <BlurZonesEditor
                            blurZones={currentMapConfig?.blurZones || []}
                            onChange={(newZones) => {
                                console.log("BlurZonesEditor onChange called with:", newZones);
                                setCurrentMapConfig(prev => ({ ...prev, blurZones: newZones }));
                            }}
                        />
                    )}

                </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 relative bg-gray-200">
                <div className="absolute inset-0">
                    {currentMapConfig?.type === 'city' && (
                        <EventMapCity
                            events={events}
                            routes={routes}
                            config={config}
                            onEventSelect={(e) => setSelectedId(e.id)}
                            draggable={true}
                            onEventDragEnd={handleEventDragEnd}
                            selectedId={selectedId}
                        />
                    )}
                    {currentMapConfig?.type === 'venue' && (
                        <EventMapVenue
                            events={events}
                            routes={routes}
                            config={config}
                            onEventSelect={(e) => setSelectedId(e.id)}
                            draggable={true}
                            onEventDragEnd={handleEventDragEnd}
                            selectedId={selectedId}
                        />
                    )}
                    {currentMapConfig?.type === 'custom' && (
                        <MapCanvas>
                            {/* <CustomMapExample /> */}
                            <ExhibitionMap2 />
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
                            {/* Blur Zones Preview (always visible in admin) */}
                            {currentMapConfig?.blurZones?.map((zone, idx) => (
                                <BlurZone
                                    key={zone.id || idx}
                                    zone={zone}
                                    onReveal={() => { }}
                                    isRevealed={false}
                                />
                            ))}
                            {events.map((event) => (
                                <CityMapMarker
                                    key={event.id}
                                    event={event}
                                    isSelected={selectedId === event.id}
                                    onClick={() => setSelectedId(event.id)}
                                    draggable={true}
                                    onDragEnd={(newPos) => handleEventDragEnd(event.id, newPos)}
                                />
                            ))}
                            <WalkingMan position={events.find(e => e.id === selectedId)?.position} />
                        </MapCanvas>
                    )}
                    {currentMapConfig?.type === 'area' && (
                        <MapCanvas>
                            <AreaMap />
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
                            {events.map((event) => (
                                <CityMapMarker
                                    key={event.id}
                                    event={event}
                                    isSelected={selectedId === event.id}
                                    onClick={() => setSelectedId(event.id)}
                                    draggable={true}
                                    onDragEnd={(newPos) => handleEventDragEnd(event.id, newPos)}
                                />
                            ))}
                            {/* Blur Zones Preview (always visible in admin) */}
                            {currentMapConfig?.blurZones?.map((zone, idx) => (
                                <BlurZone
                                    key={zone.id || idx}
                                    zone={zone}
                                    onReveal={() => { }}
                                    isRevealed={false}
                                />
                            ))}
                            <WalkingMan position={events.find(e => e.id === selectedId)?.position} />
                        </MapCanvas>
                    )}
                    {!currentMapConfig && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a map to preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Map Selector Component
function MapSelector({ registry, selectedMapId, onSelectMap, onApply }) {
    if (!registry) {
        return <div className="text-gray-500">No map registry found</div>;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900">Select Map Type</h3>
                {registry.maps.map((map) => (
                    <button
                        key={map.id}
                        onClick={() => onSelectMap(map.id)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedMapId === map.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{map.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">{map.description}</p>
                            </div>
                            {map.id === registry.activeMapId && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                    Active
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <div>Type: <span className="font-mono">{map.type}</span></div>
                            <div>Events: <span className="font-mono">{map.eventsFile}</span></div>
                            <div>Routes: <span className="font-mono">{map.routesFile}</span></div>
                        </div>
                    </button>
                ))}
            </div>

            <button
                onClick={onApply}
                disabled={!selectedMapId || selectedMapId === registry.activeMapId}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${!selectedMapId || selectedMapId === registry.activeMapId
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                Set as Active Map
            </button>
        </div>
    );
}


// --- Sub-Editors (Simplified for brevity, can expand next) ---

function ConfigEditor({ config, onChange, completionMessage, onMessageChange }) {
    const handleChange = (section, key, value) => {
        onChange({
            ...config,
            [section]: {
                ...config[section],
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-6">
            {config.ground && (
                <div className="space-y-3">
                    <h3 className="font-bold text-gray-900">Ground Settings</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs text-gray-500">Width (%)</label>
                        <input
                            type="number" className="border p-2 rounded"
                            value={config.ground.width}
                            onChange={e => handleChange('ground', 'width', parseFloat(e.target.value))}
                        />
                        <label className="text-xs text-gray-500">Height (%)</label>
                        <input
                            type="number" className="border p-2 rounded"
                            value={config.ground.height}
                            onChange={e => handleChange('ground', 'height', parseFloat(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Corner Radius (TL TR BR BL)</label>
                        <input
                            type="text" className="border p-2 rounded w-full font-mono text-sm"
                            value={config.ground.cornerRadius}
                            onChange={e => handleChange('ground', 'cornerRadius', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Color</label>
                        <input
                            type="color" className="border p-1 rounded w-full h-10"
                            value={config.ground.color}
                            onChange={e => handleChange('ground', 'color', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {config.city && (
                <div className="space-y-3 border-t pt-4">
                    <h3 className="font-bold text-gray-900">City Grid</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs text-gray-500">Grid Size</label>
                        <input
                            type="number" className="border p-2 rounded"
                            value={config.city.gridSize}
                            onChange={e => handleChange('city', 'gridSize', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {!config.ground && !config.city && (
                <div className="text-gray-500 text-sm">
                    No editable configuration for this map type (except message).
                </div>
            )}

            {/* Completion Message Editor */}
            <div className="space-y-3 border-t pt-4">
                <h3 className="font-bold text-gray-900">Celebration Message</h3>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                        Message shown when user completes all markers (supports emoji 🕵️‍♂️🎉)
                    </label>
                    <textarea
                        className="border p-2 rounded w-full h-24 text-sm"
                        value={completionMessage}
                        onChange={(e) => onMessageChange(e.target.value)}
                        placeholder="🎉 Congratulations! You've completed the journey..."
                    />
                </div>
            </div>
        </div>
    )
}

function EventsEditor({ events, onChange }) {
    const [expandedId, setExpandedId] = useState(null);

    const updateEvent = (idx, field, value) => {
        const newEvents = [...events];
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            newEvents[idx][parent][child] = value;
        } else {
            newEvents[idx][field] = value;
        }
        onChange(newEvents);
    };

    return (
        <div className="space-y-4">
            {events.map((event, idx) => (
                <div key={event.id} className="border p-3 rounded bg-gray-50">
                    {/* Header */}
                    <div className="flex justify-between mb-2">
                        <input
                            className="font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-black outline-none flex-1"
                            value={event.title}
                            onChange={(e) => updateEvent(idx, 'title', e.target.value)}
                            placeholder="Event Title"
                        />
                        <button
                            className="text-blue-500 mx-2 text-xs"
                            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                        >
                            {expandedId === event.id ? '▼' : '▶'}
                        </button>
                        <button className="text-red-500" onClick={() => onChange(events.filter((_, i) => i !== idx))}>
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Marker Title (Short) */}
                    <div className="mb-2">
                        <input
                            className="text-xs border-b border-transparent hover:border-gray-300 focus:border-black outline-none w-full text-gray-600"
                            value={event.markerTitle || ''}
                            onChange={(e) => updateEvent(idx, 'markerTitle', e.target.value)}
                            placeholder="Marker Title (Optional - overrides Title on map)"
                        />
                    </div>

                    {/* Basic Info - Always Visible */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">X Position</span>
                            <input type="number" className="border p-1 rounded" value={event.position.x}
                                onChange={e => updateEvent(idx, 'position.x', parseFloat(e.target.value))} />
                        </label>
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">Y Position</span>
                            <input type="number" className="border p-1 rounded" value={event.position.y}
                                onChange={e => updateEvent(idx, 'position.y', parseFloat(e.target.value))} />
                        </label>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === event.id && (
                        <div className="space-y-2 pt-2 border-t">
                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Category</span>
                                <input className="border p-1 rounded" value={event.category || ''}
                                    onChange={e => updateEvent(idx, 'category', e.target.value)} />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Icon</span>
                                    <input className="border p-1 rounded" value={event.icon || ''}
                                        onChange={e => updateEvent(idx, 'icon', e.target.value)} />
                                </label>
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Icon Type</span>
                                    <select className="border p-1 rounded" value={event.iconType || 'emoji'}
                                        onChange={e => updateEvent(idx, 'iconType', e.target.value)}>
                                        <option value="emoji">Emoji</option>
                                        <option value="icon">Icon</option>
                                    </select>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Group</span>
                                    <input className="border p-1 rounded" value={event.group || ''}
                                        onChange={e => updateEvent(idx, 'group', e.target.value)}
                                        placeholder="e.g. IT, Non-IT" />
                                </label>
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Order</span>
                                    <input type="number" className="border p-1 rounded" value={event.order || ''}
                                        onChange={e => updateEvent(idx, 'order', parseInt(e.target.value))}
                                        placeholder="1, 2, 3..." />
                                </label>
                            </div>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Color</span>
                                <input type="color" className="border p-1 rounded w-full h-8" value={event.color || '#666666'}
                                    onChange={e => updateEvent(idx, 'color', e.target.value)} />
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Description</span>
                                <textarea className="border p-1 rounded text-xs" rows="2" value={event.description || ''}
                                    onChange={e => updateEvent(idx, 'description', e.target.value)} />
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Banner URL</span>
                                <input className="border p-1 rounded text-xs" value={event.banner || ''}
                                    onChange={e => updateEvent(idx, 'banner', e.target.value)} />
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Audio URL</span>
                                <input className="border p-1 rounded text-xs" value={event.audio || ''}
                                    onChange={e => updateEvent(idx, 'audio', e.target.value)} />
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">YouTube URL</span>
                                <input className="border p-1 rounded text-xs" value={event.youtubeUrl || ''}
                                    onChange={e => updateEvent(idx, 'youtubeUrl', e.target.value)}
                                    placeholder="https://youtu.be/..." />
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Location</span>
                                <input className="border p-1 rounded" value={event.location || ''}
                                    onChange={e => updateEvent(idx, 'location', e.target.value)} />
                            </label>

                            <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Click Action Type</span>
                                    <select className="border p-1 rounded" value={event.onClickType || 'link'}
                                        onChange={e => updateEvent(idx, 'onClickType', e.target.value)}>
                                        <option value="link">Link (URL)</option>
                                        <option value="action">Action (Key)</option>
                                    </select>
                                </label>
                                <label className="flex flex-col text-xs">
                                    <span className="text-gray-500 mb-1">Click Value</span>
                                    <input className="border p-1 rounded" value={event.onClick || ''}
                                        onChange={e => updateEvent(idx, 'onClick', e.target.value)}
                                        placeholder={event.onClickType === 'link' ? 'https://...' : 'action_name'} />
                                </label>
                            </div>

                            <label className="flex items-center gap-2 text-xs py-1">
                                <input type="checkbox" checked={event.openModal !== false}
                                    onChange={e => updateEvent(idx, 'openModal', e.target.checked)} />
                                <span className="text-gray-700">Open Detail Modal on Click</span>
                            </label>

                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Status</span>
                                <input className="border p-1 rounded" value={event.status || ''}
                                    onChange={e => updateEvent(idx, 'status', e.target.value)} />
                            </label>
                        </div>
                    )}
                </div>
            ))}
            <button
                onClick={() => {
                    const newId = "event-" + Date.now();
                    onChange([...events, {
                        id: newId,
                        title: "New Event",
                        position: { x: 50, y: 50 },
                        category: "General",
                        icon: "📍",
                        iconType: "emoji",
                        color: "#666666",
                        description: "",
                        banner: "",
                        audio: "",
                        location: "",
                        status: "Active"
                    }]);
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-black hover:text-black transition-colors"
            >
                <Plus className="w-4 h-4" /> Add Event
            </button>
        </div>
    )
}

function RoutesEditor({ routes, events, onChange }) {
    return (
        <div className="space-y-2">
            {routes.map((route, idx) => (
                <div key={idx} className="flex items-center gap-2 border p-2 rounded bg-white">
                    <select
                        value={route.from}
                        className="flex-1 p-1 border rounded text-xs"
                        onChange={e => {
                            const newRoutes = [...routes];
                            newRoutes[idx].from = e.target.value;
                            onChange(newRoutes);
                        }}
                    >
                        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    <span>→</span>
                    <select
                        value={route.to}
                        className="flex-1 p-1 border rounded text-xs"
                        onChange={e => {
                            const newRoutes = [...routes];
                            newRoutes[idx].to = e.target.value;
                            onChange(newRoutes);
                        }}
                    >
                        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    <button className="text-red-400" onClick={() => onChange(routes.filter((_, i) => i !== idx))}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                onClick={() => onChange([...routes, { from: events[0]?.id, to: events[1]?.id }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-black hover:text-black transition-colors"
            >
                <Plus className="w-4 h-4" /> Add Route
            </button>
        </div>
    )
}

function BlurZonesEditor({ blurZones, onChange }) {
    const [expandedId, setExpandedId] = useState(null);

    const updateZone = (idx, field, value) => {
        const newZones = [...blurZones];
        newZones[idx][field] = value;
        onChange(newZones);
    };

    const addZone = () => {
        const newId = "blur-" + Date.now();
        onChange([...blurZones, {
            id: newId,
            x: 10,
            y: 10,
            width: 20,
            height: 20,
            message: "Hidden Area"
        }]);
    };

    const removeZone = (idx) => {
        onChange(blurZones.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Blur Zones</strong> hide map sections for first-time visitors. Coordinates are in percentages (%).
            </div>

            {blurZones.map((zone, idx) => (
                <div key={zone.id || idx} className="border p-3 rounded bg-gray-50">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-sm">Zone {idx + 1}</span>
                        <div className="flex gap-2">
                            <button
                                className="text-blue-500 text-xs"
                                onClick={() => setExpandedId(expandedId === zone.id ? null : zone.id)}
                            >
                                {expandedId === zone.id ? '▼' : '▶'}
                            </button>
                            <button className="text-red-500" onClick={() => removeZone(idx)}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">X Position (%)</span>
                            <input type="number" className="border p-1 rounded" value={zone.x}
                                onChange={e => updateZone(idx, 'x', parseFloat(e.target.value))} />
                        </label>
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">Y Position (%)</span>
                            <input type="number" className="border p-1 rounded" value={zone.y}
                                onChange={e => updateZone(idx, 'y', parseFloat(e.target.value))} />
                        </label>
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">Width (%)</span>
                            <input type="number" className="border p-1 rounded" value={zone.width}
                                onChange={e => updateZone(idx, 'width', parseFloat(e.target.value))} />
                        </label>
                        <label className="flex flex-col">
                            <span className="text-gray-500 mb-1">Height (%)</span>
                            <input type="number" className="border p-1 rounded" value={zone.height}
                                onChange={e => updateZone(idx, 'height', parseFloat(e.target.value))} />
                        </label>
                    </div>

                    {expandedId === zone.id && (
                        <div className="mt-2 pt-2 border-t">
                            <label className="flex flex-col text-xs">
                                <span className="text-gray-500 mb-1">Message</span>
                                <input className="border p-1 rounded" value={zone.message || ''}
                                    onChange={e => updateZone(idx, 'message', e.target.value)}
                                    placeholder="e.g. Hidden Maze" />
                            </label>
                        </div>
                    )}
                </div>
            ))}

            <button
                onClick={addZone}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center gap-2 hover:border-black hover:text-black transition-colors"
            >
                <Plus className="w-4 h-4" /> Add Blur Zone
            </button>
        </div>
    );
}

// Simple X icon for Routes
function X({ className }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
