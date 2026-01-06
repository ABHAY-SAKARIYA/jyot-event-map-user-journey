"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MapLegend({ progress }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!progress || progress.length === 0) return null;

    // Calculate total percentage for refined preview
    const totalViewed = progress.reduce((acc, curr) => acc + curr.viewed, 0);
    const totalPoints = progress.reduce((acc, curr) => acc + curr.total, 0);
    const totalPercentage = totalPoints > 0 ? Math.round((totalViewed / totalPoints) * 100) : 0;

    return (
        <div className="absolute top-4 right-4 z-30 flex flex-col items-end">
            {/* Minimized / Toggle Button */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-gray-200 shadow-md rounded-full transition-all",
                    isOpen ? "bg-[#FA5429] text-white border-[#FA5429]" : "hover:bg-gray-50 text-gray-700"
                )}
            >
                {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                ) : (
                    <>
                        <Trophy className="w-4 h-4 text-[#FA5429]" />
                        <span className="text-xs font-bold">{totalPercentage}%</span>
                        <ChevronDown className="w-3 h-3 text-gray-400 ml-1" />
                    </>
                )}
            </motion.button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="mt-2 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 w-[220px] origin-top-right"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Your Progress
                            </h3>
                            <span className="text-xs font-mono font-medium text-gray-500">
                                {totalViewed} / {totalPoints}
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                            {progress.map((group) => (
                                <div key={group.name} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-gray-800 truncate max-w-[120px]" title={group.name}>
                                            {group.name}
                                        </span>
                                        <span className={cn(
                                            "font-mono text-xs font-bold",
                                            group.viewed === group.total ? "text-green-500" : "text-[#FA5429]"
                                        )}>
                                            {group.viewed} <span className="text-gray-400 font-normal">/ {group.total}</span>
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                group.viewed === group.total ? "bg-green-500" : "bg-[#FA5429]"
                                            )}
                                            style={{ width: `${(group.viewed / group.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
