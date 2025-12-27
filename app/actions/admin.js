
"use server";

import dbConnect from "@/lib/mongodb";
import Map from "@/models/Map";
import Event from "@/models/Event";
import Route from "@/models/Route";
import Settings from "@/models/Settings";

export async function readData(fileName) {
    console.warn("readData is deprecated. Use Mongoose models instead.");
    return null;
}

export async function writeData(fileName, data) {
    // This is kept for transition but should be avoided
    console.warn("Generic writeData is deprecated. Use specific update actions.");
    return { success: false, error: "Generic writeData is deprecated. Use specific update actions like updateEvents, updateRoutes, updateMapConfig." };
}

// Replacement for writeData for Events
export async function updateEvents(mapId, events) {
    try {
        await dbConnect();
        // Delete existing events for this map and re-insert
        await Event.deleteMany({ mapId });
        if (events && events.length > 0) {
            await Event.insertMany(events.map(e => ({ ...e, mapId })));
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating events:", error);
        return { success: false, error: error.message };
    }
}

// Replacement for writeData for Routes
export async function updateRoutes(mapId, routes) {
    try {
        await dbConnect();
        await Route.deleteMany({ mapId });
        if (routes && routes.length > 0) {
            await Route.insertMany(routes.map(r => ({ ...r, mapId })));
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating routes:", error);
        return { success: false, error: error.message };
    }
}

// Replacement for writeData for Map config
export async function updateMapConfig(mapId, config) {
    try {
        await dbConnect();
        await Map.findOneAndUpdate({ id: mapId }, { $set: { config } });
        return { success: true };
    } catch (error) {
        console.error("Error updating map config:", error);
        return { success: false, error: error.message };
    }
}

export async function authenticate(formData) {
    try {
        await dbConnect();
        const password = formData.get("password");
        const adminSetting = await Settings.findOne({ key: 'admin_password' });

        if (adminSetting && password === adminSetting.value) {
            return { success: true };
        }
        return { success: false, error: "Invalid password" };
    } catch (error) {
        console.error("Auth error:", error);
        return { success: false, error: "Authentication failed" };
    }
}

export async function getMapRegistry() {
    try {
        await dbConnect();
        const maps = await Map.find({}).lean();
        const activeMap = maps.find(m => m.isActive);

        return {
            success: true,
            data: {
                maps: maps.map(m => ({ ...m, _id: m._id.toString() })),
                activeMapId: activeMap ? activeMap.id : (maps[0]?.id || null)
            }
        };
    } catch (error) {
        console.error("Error reading map registry:", error);
        return { success: false, error: error.message };
    }
}

export async function updateActiveMap(mapId) {
    try {
        await dbConnect();
        // Reset all to inactive
        await Map.updateMany({}, { isActive: false });
        // Set selected to active
        const result = await Map.findOneAndUpdate({ id: mapId }, { isActive: true }, { new: true });

        if (!result) {
            return { success: false, error: "Map not found" };
        }

        const maps = await Map.find({}).lean();
        return {
            success: true,
            data: {
                maps: maps.map(m => ({ ...m, _id: m._id.toString() })),
                activeMapId: mapId
            }
        };
    } catch (error) {
        console.error("Error updating active map:", error);
        return { success: false, error: error.message };
    }
}

export async function getMapConfiguration(mapId) {
    try {
        await dbConnect();
        const mapConfig = await Map.findOne({ id: mapId }).lean();
        if (!mapConfig) {
            return { success: false, error: "Map configuration not found" };
        }

        const events = await Event.find({ mapId }).lean();
        const routes = await Route.find({ mapId }).lean();

        return {
            success: true,
            data: {
                mapConfig: { ...mapConfig, _id: mapConfig._id.toString() },
                events: events.map(e => ({ ...e, _id: e._id.toString() })),
                routes: routes.map(r => ({ ...r, _id: r._id.toString() })),
                config: mapConfig.config || {}
            }
        };
    } catch (error) {
        console.error("Error loading map configuration:", error);
        return { success: false, error: error.message };
    }
}

export async function getActiveMapConfiguration(selectMapId) {
    try {
        await dbConnect();
        let targetId = selectMapId;

        if (!targetId) {
            const activeMap = await Map.findOne({ isActive: true }).lean();
            targetId = activeMap?.id || (await Map.findOne({}).lean())?.id;
        }

        if (!targetId) {
            return { success: false, error: "No maps found" };
        }

        return await getMapConfiguration(targetId);
    } catch (error) {
        console.error("Error loading active map configuration:", error);
        return { success: false, error: error.message };
    }
}
