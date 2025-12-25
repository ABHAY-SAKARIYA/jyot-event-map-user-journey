
"use client";

import { authenticate } from "@/app/actions/admin";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const result = await authenticate(formData);

        if (result.success) {
            router.push("/admin/dashboard");
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 text-black dark:text-white">
            <div className="w-full max-w-md p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10">
                <h1 className="text-2xl font-bold mb-6 text-center font-serif">Admin Access</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter password..."
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

                    <button
                        type="submit"
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
