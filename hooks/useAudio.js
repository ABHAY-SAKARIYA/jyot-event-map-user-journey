"use client";

import { useState, useRef, useEffect } from "react";

export function useAudio() {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [progress, setProgress] = useState(0);

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Initialize Audio element
    useEffect(() => {
        audioRef.current = new Audio();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Update progress
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setDuration(audio.duration);
                setCurrentTime(audio.currentTime);
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => setIsPlaying(false);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [currentTrack]);


    const playTrack = (url) => {
        if (!audioRef.current) return;

        if (currentTrack === url && isPlaying) {
            // Pause if clicking same playing track
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Play new track or resume
            if (currentTrack !== url) {
                audioRef.current.src = url;
                setCurrentTrack(url);
                setProgress(0);
            }
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e)); // Autoplay policies might block
            setIsPlaying(true);
        }
    };

    const pauseTrack = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const seek = (value) => {
        if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
            setProgress(value);
        }
    }

    return {
        isPlaying,
        currentTrack,
        progress,
        duration,
        currentTime,
        playTrack,
        pauseTrack,
        seek
    };
}
