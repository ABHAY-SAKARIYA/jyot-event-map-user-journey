
import mongoose from 'mongoose';

const RouteSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mapId: { type: String, required: true },
    from: { type: String, required: true }, // event id
    to: { type: String, required: true }    // event id
}, {
    timestamps: true
});

export default mongoose.models.Route || mongoose.model('Route', RouteSchema);
