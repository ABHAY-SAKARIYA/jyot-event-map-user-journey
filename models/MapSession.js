import mongoose from 'mongoose';

const MapSessionSchema = new mongoose.Schema({
    userId: { type: String, required: false, index: true },
    userEmail: { type: String, required: false, index: true }, // Ideally required, but optional for guests if needed

    mapId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true }, // Unique session ID generated on client

    sessionStartTime: { type: Date, default: Date.now },
    sessionLastUpdate: { type: Date, default: Date.now },

    totalSessionDuration: { type: Number, default: 0 }, // Total time in seconds
    activeSessionDuration: { type: Number, default: 0 }, // Active time in seconds

    completed: { type: Boolean, default: false }
}, { timestamps: true });

// Compound index for efficient querying of user sessions per map
MapSessionSchema.index({ userEmail: 1, mapId: 1 });
MapSessionSchema.index({ userId: 1, mapId: 1 });

export default mongoose.models.MapSession || mongoose.model('MapSession', MapSessionSchema);
