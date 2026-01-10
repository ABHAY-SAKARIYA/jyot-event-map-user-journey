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
    timestamp: { type: Date, default: Date.now },

    // Session Tracking (WebView-compatible)
    mapSessionId: { type: String, index: true }, // Unique per page load
    sessionStartTime: { type: Date }, // When user entered map
    sessionLastUpdate: { type: Date }, // Last periodic save timestamp
    totalSessionDuration: { type: Number, default: 0 }, // Total seconds on map
    activeSessionDuration: { type: Number, default: 0 }, // Active tab time only

    // Journey Completion
    hasSeenCelebration: { type: Boolean, default: false }, // Once per user ever
    celebrationShownAt: { type: Date } // When celebration was shown
}, { timestamps: true });

// Compound index to quickly find user progress
AnalyticsSchema.index({ userEmail: 1, eventId: 1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
