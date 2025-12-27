
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Inline Models because we are running as a standalone script
const MapSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    eventsFile: { type: String },
    routesFile: { type: String },
    configFile: { type: String },
    component: { type: String },
    svgComponent: { type: String },
    isActive: { type: Boolean, default: false }
});

const EventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mapId: { type: String, required: true },
    title: { type: String, required: true },
    position: { x: Number, y: Number },
    category: { type: String },
    icon: { type: String },
    iconType: { type: String },
    color: { type: String },
    description: { type: String },
    banner: { type: String },
    audio: { type: String },
    location: { type: String },
    status: { type: String }
});

const RouteSchema = new mongoose.Schema({
    mapId: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true }
});

const SettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
});

const Map = mongoose.models.Map || mongoose.model('Map', MapSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
const Route = mongoose.models.Route || mongoose.model('Route', RouteSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrate() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // 1. Migrate Registry (Maps)
        console.log('Migrating Map Registry...');
        const registryContent = await fs.readFile(path.join(DATA_DIR, 'mapRegistry.json'), 'utf-8');
        const registry = JSON.parse(registryContent);

        for (const mapData of registry.maps) {
            const isActive = mapData.id === registry.activeMapId;
            await Map.findOneAndUpdate(
                { id: mapData.id },
                { ...mapData, isActive },
                { upsert: true, new: true }
            );
            console.log(`- Map migrated: ${mapData.id} (Active: ${isActive})`);

            // 2. Migrate Events for this map
            if (mapData.eventsFile) {
                console.log(`  Migrating Events from ${mapData.eventsFile}...`);
                try {
                    const eventsContent = await fs.readFile(path.join(DATA_DIR, mapData.eventsFile), 'utf-8');
                    const events = JSON.parse(eventsContent);
                    for (const eventData of events) {
                        await Event.findOneAndUpdate(
                            { id: eventData.id },
                            { ...eventData, mapId: mapData.id },
                            { upsert: true }
                        );
                    }
                    console.log(`    Done: ${events.length} events.`);
                } catch (e) {
                    console.warn(`    Warning: Could not read ${mapData.eventsFile}: ${e.message}`);
                }
            }

            // 3. Migrate Routes for this map
            if (mapData.routesFile) {
                console.log(`  Migrating Routes from ${mapData.routesFile}...`);
                try {
                    const routesContent = await fs.readFile(path.join(DATA_DIR, mapData.routesFile), 'utf-8');
                    const routes = JSON.parse(routesContent);
                    // Routes don't have unique IDs in JSON, so we might duplicate if not careful.
                    // For migration, we'll clear and re-insert or use a simplified approach.
                    await Route.deleteMany({ mapId: mapData.id });
                    if (Array.isArray(routes)) {
                        for (const routeData of routes) {
                            await Route.create({ ...routeData, mapId: mapData.id });
                        }
                    }
                    console.log(`    Done: ${routes.length} routes.`);
                } catch (e) {
                    console.warn(`    Warning: Could not read ${mapData.routesFile}: ${e.message}`);
                }
            }
        }

        // 4. Initial Admin Password
        console.log('Setting initial admin password...');
        await Settings.findOneAndUpdate(
            { key: 'admin_password' },
            { value: 'admin123' },
            { upsert: true }
        );
        console.log('- Admin password set to: admin123');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
