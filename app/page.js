"use client";

import { useState } from "react";
import EventMap from "@/components/map/EventMap";
import BottomSheet from "@/components/ui/BottomSheet";
import { useAudio } from "@/hooks/useAudio";
import EventMapCity from "@/components/map/EventMapCity";

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const audioControl = useAudio();

  const handleEventSelect = (event) => {
    // If selecting a different event, we might want to stop previous audio? 
    // The prompt says: "Audio stops when: Another event is opened or Bottom sheet is closed"
    // We can handle this logic here or let audioControl handle it if we passed context.
    // The current useAudio implementation stops previous if playTrack is called with new URL.
    // But if we just OPEN the sheet, we shouldn't auto-play necessarily unless desired.
    // Let's just set the event. The user clicks play.

    // However, "Audio stops when Bottom sheet is closed".
    if (selectedEvent && selectedEvent.id !== event.id) {
      audioControl.pauseTrack();
    }

    setSelectedEvent(event);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    audioControl.pauseTrack();
  };

  return (
    <main className="relative w-full h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        {/* <EventMap onEventSelect={handleEventSelect} /> */}
        <EventMapCity onEventSelect={handleEventSelect} />
      </div>

      {/* UI Overlay */}
      {/* <div className="absolute top-0 left-0 p-6 z-10 pointer-events-none">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-400 drop-shadow-sm">
          EventMap
        </h1>
        <p className="text-neutral-500 font-medium">Interactive Festival Guide</p>
      </div> */}

      {/* Details Sheet / Panel */}
      <BottomSheet
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={handleClose}
        audioControl={audioControl}
      />
    </main>
  );
}
