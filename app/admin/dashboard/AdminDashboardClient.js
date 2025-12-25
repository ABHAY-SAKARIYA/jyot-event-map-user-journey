
"use client";

import { useState } from "react";
import EventMapCity from "@/components/map/EventMapCity";
import { writeData } from "@/app/actions/admin";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

export default function AdminDashboardClient({ initialEvents, initialRoutes, initialConfig }) {
    const [activeTab, setActiveTab] = useState("config"); // config | events | routes
    const [isSaving, setIsSaving] = useState(false);

    // Local State for editing
    const [config, setConfig] = useState(initialConfig);
    const [events, setEvents] = useState(initialEvents);
    const [routes, setRoutes] = useState(initialRoutes);

    // Universal Save Handler - Save ALL data
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await writeData("mapConfig.json", config);
            await writeData("events.json", events);
            await writeData("routes.json", routes);
            alert("All changes saved successfully!");
        } catch (e) {
            alert("Error saving: " + e.message);
        }
        setIsSaving(false);
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
                        disabled={isSaving}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b bg-gray-50">
                    {["config", "events", "routes"].map(tab => (
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

                    {activeTab === "config" && (
                        <ConfigEditor config={config} onChange={setConfig} />
                    )}

                    {activeTab === "events" && (
                        <EventsEditor events={events} onChange={setEvents} />
                    )}

                    {activeTab === "routes" && (
                        <RoutesEditor routes={routes} events={events} onChange={setRoutes} />
                    )}

                </div>
            </div>

            {/* Live Preview Pane */}
            <div className="flex-1 relative bg-gray-200">
                <div className="absolute inset-0">
                    <EventMapCity
                        events={events}
                        routes={routes}
                        config={config}
                        onEventSelect={() => { }}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Sub-Editors (Simplified for brevity, can expand next) ---

function ConfigEditor({ config, onChange }) {
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
                                <span className="text-gray-500 mb-1">Location</span>
                                <input className="border p-1 rounded" value={event.location || ''}
                                    onChange={e => updateEvent(idx, 'location', e.target.value)} />
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

// Simple X icon for Routes
function X({ className }) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
}
