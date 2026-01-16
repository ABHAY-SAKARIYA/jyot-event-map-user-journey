
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
    console.warn("Generic writeData is deprecated. Use specific update actions.");
    return { success: false, error: "Generic writeData is deprecated. Use specific update actions like updateEvents, updateRoutes, updateMapConfig." };
}

// Optimized update for Events using bulkWrite
export async function updateEvents(mapId, events) {
    try {
        await dbConnect();

        if (!events || events.length === 0) {
            await Event.deleteMany({ mapId });
            return { success: true };
        }

        const bulkOps = events.map(event => ({
            updateOne: {
                filter: { id: event.id },
                update: { $set: { ...event, mapId } },
                upsert: true
            }
        }));

        // Identify and delete events no longer present in the payload
        const currentEventIds = events.map(e => e.id);
        const deleteOp = {
            deleteMany: {
                filter: { mapId, id: { $nin: currentEventIds } }
            }
        };

        bulkOps.push(deleteOp);

        await Event.bulkWrite(bulkOps);
        return { success: true };
    } catch (error) {
        console.error("Error updating events:", error);
        return { success: false, error: error.message };
    }
}

// Optimized update for Routes using bulkWrite
export async function updateRoutes(mapId, routes) {
    try {
        await dbConnect();

        if (!routes || routes.length === 0) {
            await Route.deleteMany({ mapId });
            return { success: true };
        }

        const bulkOps = routes.map(route => ({
            updateOne: {
                filter: { id: route.id },
                update: { $set: { ...route, mapId } },
                upsert: true
            }
        }));

        // Identify and delete routes no longer present in the payload
        const currentRouteIds = routes.map(r => r.id);
        const deleteOp = {
            deleteMany: {
                filter: { mapId, id: { $nin: currentRouteIds } }
            }
        };

        bulkOps.push(deleteOp);

        await Route.bulkWrite(bulkOps);
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

// Update blur zones for a map
export async function updateBlurZones(mapId, blurZones) {
    try {
        await dbConnect();
        console.log("updateBlurZones called with:", { mapId, blurZones });
        const result = await Map.findOneAndUpdate(
            { id: mapId },
            { $set: { blurZones } },
            { new: true }
        );
        console.log("updateBlurZones result:", result?.blurZones);
        return { success: true };
    } catch (error) {
        console.error("Error updating blur zones:", error);
        return { success: false, error: error.message };
    }
}

// Update completion message for a map
export async function updateCompletionMessage(mapId, completionMessage) {
    try {
        await dbConnect();
        await Map.findOneAndUpdate(
            { id: mapId },
            { $set: { completionMessage } },
            { new: true }
        );
        return { success: true };
    } catch (error) {
        console.error("Error updating completion message:", error);
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

export async function getMapConfiguration(mapId, onlyActive = false) {
    try {
        await dbConnect();
        const mapConfig = await Map.findOne({ id: mapId }).lean();
        if (!mapConfig) {
            return { success: false, error: "Map configuration not found" };
        }

        const eventsQuery = { mapId };
        if (onlyActive) {
            eventsQuery.status = "Active";
        }

        const events = await Event.find(eventsQuery).lean();
        const routes = await Route.find({ mapId }).lean();

        // Serialize mapConfig (handle _id and blurZones)
        const serializedMapConfig = {
            ...mapConfig,
            _id: mapConfig._id.toString(),
            blurZones: mapConfig.blurZones?.map(bz => ({
                ...bz,
                _id: bz._id ? bz._id.toString() : undefined
            }))
        };

        return {
            success: true,
            data: {
                mapConfig: serializedMapConfig,
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

        return await getMapConfiguration(targetId, true);
    } catch (error) {
        console.error("Error loading active map configuration:", error);
        return { success: false, error: error.message };
    }
}
