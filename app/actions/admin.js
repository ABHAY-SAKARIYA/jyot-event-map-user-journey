
"use server";

import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function readData(fileName) {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        const fileContent = await fs.readFile(filePath, "utf-8");
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return null;
    }
}

export async function writeData(fileName, data) {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        // Pretty print JSON
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        return { success: true };
    } catch (error) {
        console.error(`Error writing ${fileName}:`, error);
        return { success: false, error: error.message };
    }
}

export async function authenticate(formData) {
    const password = formData.get("password");
    // Hardcoded password for local dev as requested
    if (password === "admin123") {
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}

export async function getMapRegistry() {
    try {
        const registry = await readData("mapRegistry.json");
        return { success: true, data: registry };
    } catch (error) {
        console.error("Error reading map registry:", error);
        return { success: false, error: error.message };
    }
}

export async function updateActiveMap(mapId) {
    try {
        const registry = await readData("mapRegistry.json");
        if (!registry) {
            return { success: false, error: "Registry not found" };
        }

        const mapExists = registry.maps.find(m => m.id === mapId);
        if (!mapExists) {
            return { success: false, error: "Map not found" };
        }

        registry.activeMapId = mapId;
        await writeData("mapRegistry.json", registry);
        return { success: true, data: registry };
    } catch (error) {
        console.error("Error updating active map:", error);
        return { success: false, error: error.message };
    }
}

export async function getMapConfiguration(mapId) {
    try {
        const registry = await readData("mapRegistry.json");
        if (!registry) {
            return { success: false, error: "Registry not found" };
        }

        const mapConfig = registry.maps.find(m => m.id === mapId);
        if (!mapConfig) {
            return { success: false, error: "Map configuration not found" };
        }

        // Load all related data files
        const events = await readData(mapConfig.eventsFile);
        const routes = await readData(mapConfig.routesFile);
        const config = mapConfig.configFile ? await readData(mapConfig.configFile) : null;

        return {
            success: true,
            data: {
                mapConfig,
                events,
                routes,
                config
            }
        };
    } catch (error) {
        console.error("Error loading map configuration:", error);
        return { success: false, error: error.message };
    }
}

export async function getActiveMapConfiguration(selectMapId) {
    try {
        const registry = await readData("mapRegistry.json");
        if (!registry) {
            return { success: false, error: "Registry not found" };
        }

        return await getMapConfiguration(selectMapId || registry.activeMapId);
    } catch (error) {
        console.error("Error loading active map configuration:", error);
        return { success: false, error: error.message };
    }
}
