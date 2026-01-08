"use client";

import { useState, useEffect, useCallback } from "react";
import EventMap from "@/components/map/EventMap";
import BottomSheet from "@/components/ui/BottomSheet";
import { useAudio } from "@/hooks/useAudio";
import { useEventData } from "@/hooks/useEventData";
import { getUserProgress } from "@/app/actions/analytics";
import MapLegend from "@/components/map/MapLegend";
import { useUserParams } from "@/hooks/useUserParams";
import EmailPromptModal from "@/components/ui/EmailPromptModal";

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const audioControl = useAudio();
  const { events, routes, mapConfig, loading } = useEventData();
  const [progress, setProgress] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);

  // URL Params for Analytics
  const userDetails = useUserParams();
  const { userId, userEmail } = userDetails || {};

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
    </main>
  );
}
