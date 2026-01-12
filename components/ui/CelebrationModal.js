"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

export default function CelebrationModal({ isOpen, message, onClose }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Trigger confetti when modal opens
    useEffect(() => {
        if (!isOpen) return;

        // Mobile-optimized confetti configuration
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const runConfetti = () => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return;

            // Reduced particle count for mobile performance
            const particleCount = window.innerWidth < 768 ? 30 : 50;

            confetti({
                particleCount,
                angle: randomInRange(55, 125),
                spread: randomInRange(50, 70),
                origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                colors: ['#FA5429', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3']
            });

            requestAnimationFrame(runConfetti);
        };

        runConfetti();

        // Cleanup
        return () => {
            confetti.reset();
        };
    }, [isOpen]);

    const handleStartQuiz = () => {
        // Forward all existing params to the quiz page
        const params = searchParams.toString();
        const url = `/quiz${params ? `?${params}` : ''}`;

        // Use replace to avoid back-history confusion in WebViews
        router.replace(url);
    };

    const defaultMessage = "🎉 Congratulations! You've completed the journey thoroughly and must have learned something from this!";
    const displayMessage = message || defaultMessage;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[100] backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
                            {/* Close Button - Large and touch-friendly */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>

                            {/* Content */}
                            <div className="text-center space-y-6">
                                {/* Celebration Icon */}
                                <div className="text-8xl animate-bounce">
                                    🎉
                                </div>

                                {/* Message */}
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Amazing!
                                    </h2>
                                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {displayMessage}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <button
                                        onClick={handleStartQuiz}
                                        className="w-full py-4 bg-[#FA5429] text-white rounded-2xl font-bold text-lg hover:bg-[#E94A23] transition-colors active:scale-95 shadow-lg shadow-orange-200"
                                    >
                                        Start Quiz
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 font-medium hover:text-gray-700 text-sm"
                                    >
                                        Return to Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
