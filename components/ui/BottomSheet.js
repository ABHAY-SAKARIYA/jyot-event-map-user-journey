"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export default function BottomSheet({ event, isOpen, onClose, audioControl }) {
    // Autoplay effect when modal opens
    useEffect(() => {
        if (isOpen && event?.audio) {
            audioControl.playTrack(event.audio);
        }
    }, [isOpen, event?.id, event?.audio]);

    if (!event) return null;

    const isAudioPlaying = audioControl.isPlaying && audioControl.currentTrack === event.audio;

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(event.youtubeUrl);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:bg-black/40"
                    />

                    {/* Premium Card UI */}
                    <motion.div
                        initial={{ y: "110%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "110%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed z-50 bg-white shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)] 
                       w-full h-[85vh] bottom-0 left-0 rounded-t-[32px] overflow-hidden
                       md:max-w-md md:h-[90vh] md:bottom-6 md:left-auto md:right-6 md:rounded-[32px] md:border md:border-gray-200"
                    >
                        {/* Drag Handle (Mobile) */}
                        <div className="absolute top-0 left-0 right-0 h-6 z-20 flex justify-center pt-2 md:hidden pointer-events-none">
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                        </div>

                        <div className="relative h-full flex flex-col overflow-y-auto no-scrollbar">

                            {/* Hero Header */}
                            <div className="relative h-72 shrink-0">
                                <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />

                                {/* Gradient Overlay for text readability on image */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-30 bg-white/20 text-white hover:bg-white/40 rounded-full backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </Button>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex gap-2 mb-3">
                                        <span className="px-3 py-1 bg-[#FA5429] text-white text-xs font-bold uppercase tracking-wider rounded-full">
                                            {event.category}
                                        </span>
                                        <span className="px-3 py-1 bg-black/30 text-white text-xs font-medium uppercase tracking-wider rounded-full backdrop-blur-sm border border-white/20">
                                            {event.status}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-serif text-white leading-tight">
                                        {event.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2 text-white/90 text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {/* Content Body - White Background */}
                            <div className="flex-1 bg-white text-black px-6 py-6 space-y-8 min-h-[500px]">

                                {/* Description */}
                                <div className="space-y-4">
                                    <h4 className="text-xl font-serif text-black">About this space</h4>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Audio Player Card */}
                                <div className="relative bg-gray-50 border border-gray-100 rounded-2xl p-5 overflow-hidden group shadow-sm">
                                    <div className="absolute top-0 right-0 p-3 opacity-5">
                                        <Play className="w-24 h-24 text-black" />
                                    </div>

                                    <div className="relative z-10">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Audio Guide</h4>
                                        <h3 className="text-xl font-serif text-gray-900 mb-4">Voice of the {event.title}</h3>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => audioControl.playTrack(event.audio)}
                                                className="w-12 h-12 flex items-center justify-center bg-[#FA5429] text-white rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-orange-200 shrink-0"
                                            >
                                                {isAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                            </button>

                                            {/* Interactive Waveform & Time */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <InteractiveWaveform
                                                    isPlaying={isAudioPlaying}
                                                    progress={audioControl.progress}
                                                    onSeek={audioControl.seek}
                                                />
                                                <div className="flex justify-between mt-1 px-1">
                                                    <span className="text-[10px] items-center text-gray-400 font-mono font-medium">
                                                        {formatTime(audioControl.currentTime || 0)}
                                                    </span>
                                                    <span className="text-[10px] items-center text-gray-400 font-mono font-medium">
                                                        {formatTime(audioControl.duration || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* YouTube Embed */}
                                {youtubeId && (
                                    <div className="space-y-4">
                                        <h4 className="text-xl font-serif text-black">Video Guide</h4>
                                        <div className="relative w-full pt-[56.25%] rounded-2xl overflow-hidden bg-black shadow-lg">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                                className="absolute top-0 left-0 w-full h-full"
                                                title="YouTube video player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="h-12" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function InteractiveWaveform({ isPlaying, progress, onSeek }) {
    const bars = 30; // Increased resolution
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSeek = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;
        onSeek(percentage);
    };

    return (
        <div
            ref={containerRef}
            className="flex gap-[2px] items-center h-8 cursor-pointer group py-1"
            onPointerDown={(e) => {
                setIsDragging(true);
                handleSeek(e);
            }}
            onPointerMove={(e) => {
                if (isDragging) handleSeek(e);
            }}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)}
        >
            {[...Array(bars)].map((_, i) => {
                const isFilled = (i / bars) < ((progress || 0) / 100);
                return (
                    <div
                        key={i}
                        className={cn(
                            "w-1 rounded-full transition-all duration-150",
                            isFilled ? "bg-[#FA5429]" : "bg-gray-200 group-hover:bg-gray-300"
                        )}
                        style={{
                            height: isPlaying
                                ? `${30 + (Math.sin(i + Date.now() / 1000) * 40)}%` // This won't animate well in React render loop without frame loop, reverted to static or css anim
                                : `${30 + (Math.sin(i) * 20)}%`,
                            // Optimized animation:
                            animation: isPlaying ? `waveform 1s infinite ease-in-out ${i * 0.1}s` : 'none',
                        }}
                    />
                );
            })}
            <style jsx>{`
                @keyframes waveform {
                    0%, 100% { height: 30%; }
                    50% { height: 80%; }
                }
            `}</style>
        </div>
    )
}
