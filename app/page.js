"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import EventMap from "@/components/map/EventMap";
import BottomSheet from "@/components/ui/BottomSheet";
import { useAudio } from "@/hooks/useAudio";
import { useEventData } from "@/hooks/useEventData";
import { getUserProgress, saveMapSession, checkHasSeenCelebration, markCelebrationSeen } from "@/app/actions/analytics";
import MapLegend from "@/components/map/MapLegend";
import { useUserParams } from "@/hooks/useUserParams";
import EmailPromptModal from "@/components/ui/EmailPromptModal";
import CelebrationModal from "@/components/ui/CelebrationModal";

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const audioControl = useAudio();
  const { events, routes, mapConfig, loading } = useEventData();
  const [progress, setProgress] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);

  // URL Params for Analytics
  const userDetails = useUserParams();
  const { userId, userEmail } = userDetails || {};

  // Session Tracking - WebView Compatible
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const sessionStartRef = useRef(Date.now());
  const activeTimeRef = useRef(0);
  const lastActiveRef = useRef(Date.now());
  const isTrackingRef = useRef(false);

  // Celebration State
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const justCompletedRef = useRef(false);

  // Only track for identified users
  const shouldTrackSession = !!(userId || userEmail);

  const fetchProgress = useCallback(async () => {
    if (!userId && !userEmail) return;
    try {
      // Pass mapId if available
      const mapId = mapConfig?.id;
      const result = await getUserProgress(userId, mapId, userEmail);
      if (result.success) {
        setProgress(result.data);
        setCompletedIds(result.completedIds || []);
      }
    } catch (error) {
      console.error("Failed to fetch progress", error);
    }
  }, [userId, userEmail, mapConfig?.id]);

  // Initial fetch depends on mapConfig being loaded
  useEffect(() => {
    if (mapConfig?.id && (userId || userEmail)) {
      fetchProgress();
    }
  }, [fetchProgress, mapConfig?.id, userId, userEmail]);

  // Initialize session tracking
  useEffect(() => {
    if (!shouldTrackSession || !mapConfig?.id) return;

    isTrackingRef.current = true;
    lastActiveRef.current = Date.now();

    // Initial session save
    saveMapSession({
      userId,
      userEmail,
      mapId: mapConfig.id,
      sessionId: sessionIdRef.current,
      duration: 0,
      activeDuration: 0
    });
  }, [shouldTrackSession, mapConfig?.id, userId, userEmail]);

  // Track visibility changes (works in WebView)
  useEffect(() => {
    if (!shouldTrackSession) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab/app backgrounded - save current active time
        if (lastActiveRef.current) {
          activeTimeRef.current += (Date.now() - lastActiveRef.current) / 1000;
          lastActiveRef.current = null;
        }
      } else {
        // Tab/app foregrounded - restart timer
        lastActiveRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [shouldTrackSession]);

  // Periodic save (PRIMARY method for WebView - every 20 seconds)
  useEffect(() => {
    if (!shouldTrackSession || !mapConfig?.id) return;

    const saveSession = async () => {
      if (!isTrackingRef.current) return;

      const totalDuration = (Date.now() - sessionStartRef.current) / 1000;
      const activeDuration = activeTimeRef.current +
        (document.hidden || !lastActiveRef.current ? 0 : (Date.now() - lastActiveRef.current) / 1000);

      await saveMapSession({
        userId,
        userEmail,
        mapId: mapConfig.id,
        sessionId: sessionIdRef.current,
        duration: totalDuration,
        activeDuration
      });
    };

    // Save every 20 seconds (optimized for WebView)
    const interval = setInterval(saveSession, 20000);

    // Final save on unmount (best effort - may not fire in WebView)
    return () => {
      clearInterval(interval);
      isTrackingRef.current = false;
      saveSession();
    };
  }, [shouldTrackSession, userId, userEmail, mapConfig?.id]);

  // Check if user has already seen celebration (on mount)
  useEffect(() => {
    const checkCelebrationStatus = async () => {
      if (!userId && !userEmail) return;
      if (!mapConfig?.id) return;

      const result = await checkHasSeenCelebration(userId, mapConfig.id, userEmail);
      if (result.success) {
        setHasSeenCelebration(result.hasSeenCelebration);
      }
    };

    checkCelebrationStatus();
  }, [userId, userEmail, mapConfig?.id]);

  // Fetch completion message from map config
  useEffect(() => {
    if (mapConfig?.completionMessage) {
      setCompletionMessage(mapConfig.completionMessage);
    }
  }, [mapConfig]);

  // Detect journey completion
  useEffect(() => {
    if (hasSeenCelebration) return; // Already seen, skip
    if (events.length === 0 || completedIds.length === 0) return;

    const activeEvents = events.filter(e => e.status === 'Active');
    const isComplete = completedIds.length >= activeEvents.length;

    if (isComplete && !justCompletedRef.current) {
      justCompletedRef.current = true; // Mark as completed
    }
  }, [completedIds, events, hasSeenCelebration]);

  const handleEventSelect = (event) => {
    // Audio stops when Another event is opened or Bottom sheet is closed
    if (selectedEvent && selectedEvent.id !== event.id) {
      audioControl.pauseTrack();
    }
    setSelectedEvent(event);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    audioControl.pauseTrack();

    // Check if this was the last marker and user just completed journey
    console.log("Journey Completed", justCompletedRef.current, hasSeenCelebration);
    if (justCompletedRef.current && !hasSeenCelebration) {
      // Trigger celebration after bottom sheet closes
      setTimeout(() => {
        setShowCelebration(true);
        // Save celebration flag to database
        markCelebrationSeen(userId, mapConfig?.id, userEmail);
        setHasSeenCelebration(true);
        justCompletedRef.current = false;
      }, 300); // Small delay for smooth transition
    }
  };

  if (loading) {
    return (
      <main className="relative w-full h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full h-screen overflow-hidden bg-white">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <EventMap onEventSelect={handleEventSelect} completedIds={completedIds} />
      </div>

      {/* Email Prompt Modal - Shows if no email in params */}
      <EmailPromptModal isOpen={(!userEmail || userEmail === "null") && !loading} />

      {/* Legend - Top Right (Sticky) */}
      <MapLegend progress={progress} />

      {/* Details Sheet / Panel */}
      <BottomSheet
        event={selectedEvent}
        allEvents={events} // Pass all events for Navigation
        isOpen={!!selectedEvent}
        onClose={handleClose}
        audioControl={audioControl}
        onInteractionComplete={fetchProgress} // Refresh progress on close
        onSwitchEvent={handleEventSelect}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        message={completionMessage}
        onClose={() => setShowCelebration(false)}
      />
    </main>
  );
}
