import events from "@/data/events.json";
import routes from "@/data/routes.json";

export function useEventData() {
  // In a real app, this could fetch from an API
  // filtering, sorting, etc. can be added here
  return {
    events,
    routes,
    getEventById: (id) => events.find((e) => e.id === id),
  };
}
