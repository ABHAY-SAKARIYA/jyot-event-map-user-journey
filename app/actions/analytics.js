"use server";

import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Event from "@/models/Event";

/**
 * Save user interaction with an event
 */
export async function saveInteraction(data) {
    try {
        await dbConnect();

        const {
            userId, eventId,
            viewDuration, audioListenDuration,
            userEmail, userPhone, userName
        } = data;

        // Validation: Need userEmail for tracking (as per new requirement)
        if (!userEmail || !eventId) {
            return { success: false, error: "Missing required fields (userEmail required)" };
        }

        const isCompleted = viewDuration > 5;

        // Find existing record by userEmail + eventId (Priority: Email)
        const query = { eventId, userEmail };

        const existing = await Analytics.findOne(query);

        if (existing) {
            existing.viewDuration = (existing.viewDuration || 0) + viewDuration;
            existing.audioListenDuration = (existing.audioListenDuration || 0) + audioListenDuration;
            if (isCompleted) existing.completed = true;

            // Update metadata
            if (userPhone) existing.userPhone = userPhone;
            if (userName) existing.userName = userName;

            // Store userId if available, but don't use it for lookup
            if (userId) existing.userId = userId;

            existing.timestamp = new Date();
            await existing.save();
        } else {
            await Analytics.create({
                userId, eventId,
                viewDuration,
                audioListenDuration,
                completed: isCompleted,
                userEmail, userPhone, userName
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error saving analytics:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Get user progress grouped by event groups for a specific map
 */
export async function getUserProgress(userId, mapId, userEmail) {
    try {
        await dbConnect();

        // STRICTLY use userEmail for tracking
        if (!userEmail) return { success: false, error: "User Email required for progress" };

        const query = { status: "Active" };
        if (mapId) {
            query.mapId = mapId;
        }

        // 1. Get all active events for this map
        const events = await Event.find(query).select("id group title category mapId").lean();

        // 2. Get all completed interactions for this user (by Email ONLY)
        const analyticsQuery = { completed: true, userEmail: userEmail };

        const interactions = await Analytics.find(analyticsQuery).select("eventId").lean();

        const completedEventIds = new Set(interactions.map(i => i.eventId));

        // 3. Aggregate data
        const progressByGroup = {};

        events.forEach(event => {
            const groupName = event.group || "Ungrouped";

            if (!progressByGroup[groupName]) {
                progressByGroup[groupName] = {
                    name: groupName,
                    total: 0,
                    viewed: 0
                };
            }

            progressByGroup[groupName].total++;
            if (completedEventIds.has(event.id)) {
                progressByGroup[groupName].viewed++;
            }
        });

        return {
            success: true,
            data: Object.values(progressByGroup),
            completedIds: Array.from(completedEventIds)
        };

    } catch (error) {
        console.error("Error fetching progress:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user is a first-time visitor for this map (to toggle blur)
 */
export async function checkFirstTimeVisitor(userId, mapId, userEmail) {
    try {
        await dbConnect();

        // If no email, treat as new visitor (safest default)
        if (!userEmail) return { success: false, isFirstTime: true };

        // Check if ANY analytics exist for this user on this map
        const events = await Event.find({ mapId }).select("_id id").lean();
        const mapEventIds = events.map(e => e.id);

        // Query by Email Only
        const query = {
            eventId: { $in: mapEventIds },
            completed: true,
            userEmail: userEmail
        };

        const existing = await Analytics.exists(query);

        return { success: true, isFirstTime: !existing };

    } catch (error) {
        console.error("Error checking visitor status:", error);
        return { success: false, isFirstTime: true };
    }
}

/**
 * Save or update map session data (WebView-compatible)
 */
export async function saveMapSession(data) {
    try {
        await dbConnect();

        const { userId, userEmail, mapId, sessionId, duration, activeDuration } = data;

        // Validation
        if ((!userId && !userEmail) || !mapId || !sessionId) {
            return { success: false, error: "Missing required fields" };
        }

        // Use MapSession model
        // Try to find existing session first
        const existing = await import("@/models/MapSession").then(mod => mod.default.findOne({ sessionId }));

        const MapSession = (await import("@/models/MapSession")).default;

        if (existing) {
            // Update existing session
            existing.totalSessionDuration = duration;
            existing.activeSessionDuration = activeDuration;
            existing.sessionLastUpdate = new Date();
            // Update user identification if it was missing and is now provided (e.g. login during session)
            if (userEmail && !existing.userEmail) existing.userEmail = userEmail;
            if (userId && !existing.userId) existing.userId = userId;

            await existing.save();
        } else {
            // Create new session record
            await MapSession.create({
                userId,
                userEmail,
                mapId,
                sessionId,
                sessionStartTime: new Date(),
                sessionLastUpdate: new Date(),
                totalSessionDuration: duration,
                activeSessionDuration: activeDuration,
                completed: false
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error saving map session:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Check if user has already seen the completion celebration
 */
export async function checkHasSeenCelebration(userId, mapId, userEmail) {
    try {
        await dbConnect();

        if (!userEmail) {
            return { success: false, hasSeenCelebration: false };
        }

        // Check any analytics record for this user on this map
        const events = await Event.find({ mapId }).select("id").lean();
        const eventIds = events.map(e => e.id);

        const query = {
            eventId: { $in: eventIds },
            hasSeenCelebration: true,
            userEmail: userEmail
        };

        const record = await Analytics.findOne(query);

        return {
            success: true,
            hasSeenCelebration: !!record
        };
    } catch (error) {
        console.error("Error checking celebration status:", error);
        return { success: false, hasSeenCelebration: false };
    }
}

/**
 * Mark that user has seen the celebration (once per user ever)
 */
export async function markCelebrationSeen(userId, mapId, userEmail) {
    try {
        await dbConnect();

        if (!userEmail) {
            return { success: false, error: "User Email required" };
        }

        // Update ALL analytics records for this user on this map
        const events = await Event.find({ mapId }).select("id").lean();
        const eventIds = events.map(e => e.id);

        const query = {
            eventId: { $in: eventIds },
            userEmail: userEmail
        };

        await Analytics.updateMany(
            query,
            {
                $set: {
                    hasSeenCelebration: true,
                    celebrationShownAt: new Date()
                }
            }
        );

        return { success: true };
    } catch (error) {
        console.error("Error marking celebration seen:", error);
        return { success: false, error: error.message };
    }
}
