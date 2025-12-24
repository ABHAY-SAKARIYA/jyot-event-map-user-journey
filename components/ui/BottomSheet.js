"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Bell, Play, Pause, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BottomSheet({ event, isOpen, onClose, audioControl }) {
    if (!event) return null;

    const isAudioPlaying = audioControl.isPlaying && audioControl.currentTrack === event.audio;

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
                        className="fixed z-50 bg-[#fbf9f4] dark:bg-[#121212] shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.3)] 
                       w-full h-[85vh] bottom-0 left-0 rounded-t-[32px] overflow-hidden
                       md:max-w-md md:h-[90vh] md:bottom-6 md:left-auto md:right-6 md:rounded-[32px] md:border md:border-white/10"
                    >
                        {/* Drag Handle (Mobile) */}
                        <div className="absolute top-0 left-0 right-0 h-6 z-20 flex justify-center pt-2 md:hidden pointer-events-none">
                            <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                        </div>

                        <div className="relative h-full flex flex-col overflow-y-auto no-scrollbar">

                            {/* Hero Header */}
                            <div className="relative h-72 shrink-0">
                                <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#121212]" />

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-30 bg-black/20 text-white hover:bg-black/40 rounded-full backdrop-blur-md"
                                >
                                    <X className="w-5 h-5" />
                                </Button>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex gap-2 mb-3">
                                        <span className="px-3 py-1 bg-[#d4a056] text-black text-xs font-bold uppercase tracking-wider rounded-full">
                                            {event.category}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 text-white text-xs font-medium uppercase tracking-wider rounded-full backdrop-blur-sm border border-white/10">
                                            {event.status}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-serif text-white leading-tight">
                                        {event.title}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
                                        <MapPinIcon className="w-4 h-4" />
                                        {event.location}
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 bg-[#121212] text-[#e0e0e0] px-6 py-6 space-y-8 min-h-[500px]">

                                {/* Ratings & Meta */}
                                {/* <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                    <div className="flex items-baseline gap-1">
                                        <h3 className="text-2xl font-serif text-white">4.9</h3>
                                        <div className="flex text-[#d4a056]">
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                        <span className="text-xs text-neutral-500 ml-1">(120 reviews)</span>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121212] bg-neutral-700" />
                                        ))}
                                    </div>
                                </div> */}

                                {/* Description */}
                                <div className="space-y-4">
                                    <h4 className="text-xl font-serif text-white">About this space</h4>
                                    <p className="text-neutral-400 leading-relaxed font-light">
                                        {event.description}
                                    </p>
                                </div>

                                {/* Audio Player Card - "Sounds of Serenity" style */}
                                <div className="relative bg-[#1a1a1c] border border-white/5 rounded-2xl p-5 overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <Play className="w-24 h-24" />
                                    </div>

                                    <div className="relative z-10">
                                        <h4 className="text-xs font-bold text-[#b4b4b4] uppercase tracking-widest mb-1">Audio Guide</h4>
                                        <h3 className="text-xl font-serif text-white mb-4">Voice of the {event.title}</h3>

                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => audioControl.playTrack(event.audio)}
                                                className="w-12 h-12 flex items-center justify-center bg-[#d4a056] text-black rounded-full hover:scale-105 active:scale-95 transition-transform"
                                            >
                                                {isAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                            </button>

                                            {/* Simulated Waveform */}
                                            <WaveformVisualizer isPlaying={isAudioPlaying} audioProgress={audioControl.progress} />
                                            <span className="text-xs text-[#d4a056] font-mono">
                                                {isAudioPlaying ? "PLAYING" : "04:30"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Sessions */}
                                {/* <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <h4 className="text-xl font-serif text-white">Upcoming Sessions</h4>
                                        <button className="text-[#d4a056] text-sm hover:underline">View All</button>
                                    </div>

                                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar">
                                        <SessionCard time="3:00 PM" title="Silence & Self" author="Muni Shri Ji" />
                                        <SessionCard time="5:30 PM" title="Karma Theory" author="Dr. Shah" />
                                    </div>
                                </div> */}

                                <div className="h-12" />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function WaveformVisualizer({ isPlaying, audioProgress }) {
    const bars = 20;

    return (
        <div className="flex-1 flex gap-[3px] items-center h-8">
            {[...Array(bars)].map((_, i) => {
                // Progress calculation: Is this bar "filled"?
                // i starts at 0. If progress is 50%, bars 0-9 should be filled.
                // i / bars < progress / 100
                const isFilled = (i / bars) < ((audioProgress || 0) / 100);

                return (
                    <div
                        key={i}
                        className={cn(
                            "w-1 rounded-full transition-colors duration-300",
                            isFilled ? "bg-[#d4a056]" : "bg-white/20"
                        )}
                        style={{
                            // Animation only affects height
                            // We use a CSS Class for animation to keep it performant
                            animation: isPlaying ? `waveform 1s infinite ease-in-out ${i * 0.1}s` : 'none',
                            height: isPlaying ? '50%' : `${30 + (Math.sin(i) * 20)}%`, // Fallback/Static height
                        }}
                    />
                );
            })}
            <style jsx>{`
                @keyframes waveform {
                    0%, 100% { height: 20%; }
                    50% { height: 100%; }
                }
            `}</style>
        </div>
    )
}

function SessionCard({ time, title, author }) {
    return (
        <div className="min-w-[200px] bg-white rounded-2xl p-4 text-black shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 bg-neutral-100 rounded text-xs font-bold text-neutral-600">
                    {time}
                </span>
                <Bell className="w-4 h-4 text-neutral-400" />
            </div>
            <h5 className="font-bold text-lg leading-tight mb-1">{title}</h5>
            <p className="text-sm text-neutral-500 mb-3">Guided meditation focusing on inner silence.</p>
            <div className="flex items-center gap-2 text-xs font-medium text-[#d4a056]">
                <div className="w-4 h-4 rounded-full bg-[#d4a056]" />
                {author}
            </div>
        </div>
    )
}

function MapPinIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
        </svg>
    )
}
