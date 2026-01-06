"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailPromptModal({ isOpen, onClose }) {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;

        // Clone current params and add email
        const params = new URLSearchParams(searchParams.toString());
        params.set("email", email);

        // Push new URL
        router.push(`?${params.toString()}`);

        if (onClose) onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FA5429] to-orange-400" />

                    <h2 className="text-2xl font-serif text-gray-900 mb-2 mt-2">Save Your Journey</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Enter your email to track your progress and resume your tour anytime.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FA5429]/20 focus:border-[#FA5429] transition-all"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-[#FA5429] hover:bg-[#FA5429]/90 text-white py-6 text-lg rounded-xl"
                        >
                            Continue Tour
                        </Button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
