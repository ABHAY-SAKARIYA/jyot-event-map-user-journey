"use client";

import { useState, useEffect } from "react";
import { getActiveMapConfiguration } from "@/app/actions/admin";

export function useEventData() {
  const [events, setEvents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [mapConfig, setMapConfig] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getActiveMapConfiguration();
      if (result.success) {
        setEvents(result.data.events || []);
        setRoutes(result.data.routes || []);
        setMapConfig(result.data.mapConfig || null);
        setConfig(result.data.config || null);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return {
    events,
    routes,
    mapConfig,
    config,
    loading,
    getEventById: (id) => events.find((e) => e.id === id),
  };
}
