
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    mapId: { type: String, required: true },
    title: { type: String, required: true },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    category: { type: String },
    icon: { type: String },
    iconType: { type: String, enum: ['emoji', 'icon'], default: 'emoji' },
    color: { type: String },
    description: { type: String },
    banner: { type: String },
    audio: { type: String },
    location: { type: String },
    status: { type: String },
    onClickType: { type: String, enum: ['link', 'action'], default: 'link' },
    onClick: { type: String },
    youtubeUrl: { type: String },
    openModal: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
