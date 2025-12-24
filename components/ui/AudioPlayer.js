"use client";

import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
// Note: using shadcn slider if available, else I'll simulate or use standard input range. 
// I didn't verify if 'slider' component exists in what I generated, but shadcn init usually installs utils. 
// Attempting to use standard input for 'progress' to be safe and dependency-free aside from lucide.

import { cn } from "@/lib/utils";

export default function AudioPlayer({ isPlaying, togglePlay, progress, onSeek, className }) {
    return (
        <div className={cn("flex items-center gap-4 w-full p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl", className)}>
            <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-full border-neutral-300 dark:border-neutral-600"
                onClick={togglePlay}
            >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>

            <div className="flex-1 flex flex-col justify-center">
                {/* Custom Progress Bar */}
                <div className="relative w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden cursor-pointer group">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress || 0}
                        onChange={(e) => onSeek(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div
                        className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
