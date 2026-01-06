import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // Optional if using email
    userEmail: { type: String, index: true }, // Indexed for lookup
    userPhone: { type: String }, // phoneNumber
    userName: { type: String }, // name

    eventId: { type: String, required: true, index: true }, // Event ID

    viewDuration: { type: Number, default: 0 }, // Seconds
    audioListenDuration: { type: Number, default: 0 }, // Seconds

    completed: { type: Boolean, default: false }, // If viewDuration > 5s
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to quickly find user progress
AnalyticsSchema.index({ userEmail: 1, eventId: 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
