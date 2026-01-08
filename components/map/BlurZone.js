"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Lock, EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BlurZone({ zone, onReveal, isRevealed }) {
    const [isHovered, setIsHovered] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    if (isRevealed) return null;

    const handleInteraction = (e) => {
        e.stopPropagation(); // Prevent map clicks
        setShowConfirm(true);
    };

    const handleConfirm = (e) => {
        e.stopPropagation();
        onReveal(zone.id);
        setShowConfirm(false);
    };

    return (
        <div
            className="absolute z-10"
            style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {!isRevealed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                    >
                        {/* The Blur Effect */}
                        <div
                            className="absolute inset-0 backdrop-blur-md bg-white/10 border border-white/20 shadow-xl rounded-2xl cursor-pointer transition-all hover:bg-white/20 hover:backdrop-blur-lg"
                            onClick={handleInteraction}
                        >
                            {/* Stripes pattern overlay for better visibility of blur area */}
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}
                            />
                        </div>

                        {/* Center Content / Icon */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <motion.div
                                className="flex flex-col items-center justify-center p-4 text-center"
                                animate={{ scale: isHovered ? 1.05 : 1 }}
                            >
                                <div className="w-12 h-12 bg-black/80 text-white rounded-full flex items-center justify-center mb-2 shadow-lg backdrop-blur-sm">
                                    <Lock className="w-6 h-6" />
                                </div>
                                {zone.message && (
                                    <span className="px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-full backdrop-blur-md">
                                        {zone.message}
                                    </span>
                                )}
                            </motion.div>
                        </div>

                        {/* Confirmation Modal (Relative to zone) */}
                        {showConfirm && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm rounded-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-white p-4 rounded-xl shadow-2xl text-center max-w-[200px]">
                                    <h4 className="text-sm font-bold text-gray-900 mb-2">Reveal Area?</h4>
                                    <p className="text-xs text-gray-500 mb-3">This will uncover the hidden section.</p>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="px-3 py-1.5 text-xs font-bold text-white bg-[#FA5429] rounded-lg hover:bg-[#FA5429]/90 flex items-center gap-1"
                                        >
                                            <Eye className="w-3 h-3" /> Reveal
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
