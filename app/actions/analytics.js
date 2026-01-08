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

        // Validation: Need at least userId OR userEmail
        if ((!userId && !userEmail) || !eventId) {
            return { success: false, error: "Missing required fields (userId or userEmail required)" };
        }

        const isCompleted = viewDuration > 5;

        // Find existing record by userId OR userEmail + eventId
        const query = { eventId };
        if (userId) query.userId = userId;
        else query.userEmail = userEmail;

        const existing = await Analytics.findOne(query);

        if (existing) {
            existing.viewDuration = (existing.viewDuration || 0) + viewDuration;
            existing.audioListenDuration = (existing.audioListenDuration || 0) + audioListenDuration;
            if (isCompleted) existing.completed = true;

            // Update metadata
            if (userEmail) existing.userEmail = userEmail;
            if (userPhone) existing.userPhone = userPhone;
            if (userName) existing.userName = userName;
            // if userId was missing but now present, update it? 
            if (userId && !existing.userId) existing.userId = userId;

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

        if (!userId && !userEmail) return { success: false, error: "UserID or Email required" };

        const query = { status: "Active" };
        if (mapId) {
            query.mapId = mapId;
        }

        // 1. Get all active events for this map
        const events = await Event.find(query).select("id group title category mapId").lean();

        // 2. Get all completed interactions for this user (by ID or Email)
        const analyticsQuery = { completed: true };
        if (userId) {
            analyticsQuery.userId = userId;
        } else {
            analyticsQuery.userEmail = userEmail;
        }

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

        if (!userId && !userEmail) return { success: false, isFirstTime: true }; // Default to true if unknown

        // Check if ANY analytics exist for this user on this map
        const events = await Event.find({ mapId }).select("_id id").lean();
        const mapEventIds = events.map(e => e.id);

        const query = {
            eventId: { $in: mapEventIds },
            completed: true
        };

        if (userId) query.userId = userId;
        else query.userEmail = userEmail;

        const existing = await Analytics.exists(query);

        return { success: true, isFirstTime: !existing };

    } catch (error) {
        console.error("Error checking visitor status:", error);
        return { success: false, isFirstTime: true };
    }
}
