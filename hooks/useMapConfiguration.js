"use client";

import { useState, useEffect } from "react";
import { getActiveMapConfiguration } from "@/app/actions/admin";

/**
 * Hook to manage map configuration loading and switching
 */
export function useMapConfiguration() {
    const [configuration, setConfiguration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadConfiguration = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getActiveMapConfiguration();

            if (result.success) {
                setConfiguration(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfiguration();
    }, []);

    return {
        configuration,
        loading,
        error,
        reload: loadConfiguration
    };
}
