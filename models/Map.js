
import mongoose from 'mongoose';

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
    config: { type: mongoose.Schema.Types.Mixed },
    blurZones: [{
        id: { type: String },
        x: { type: Number }, // %
        y: { type: Number }, // %
        width: { type: Number }, // %
        height: { type: Number }, // %
        message: { type: String }
    }],
    isActive: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Map || mongoose.model('Map', MapSchema);
