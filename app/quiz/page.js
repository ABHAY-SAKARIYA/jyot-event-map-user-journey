"use client";

import { useEffect, useState, useRef } from "react";
import { getQuizQuestions, submitQuiz } from "@/app/actions/quiz";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useUserParams } from "@/hooks/useUserParams";

export default function QuizPage() {
    const [status, setStatus] = useState("idle"); // idle, loading, active, submitting, completed, error
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
    const [result, setResult] = useState(null);

    const { userEmail: paramEmail } = useUserParams() || {};
    const [userEmail, setUserEmail] = useState("");

    // Sync state with param email when available
    useEffect(() => {
        if (paramEmail) {
            setUserEmail(paramEmail);
        }
    }, [paramEmail]);

    // Create a session ID once per page load
    const sessionIdRef = useRef(`quiz-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const loadQuestions = async () => {
        setStatus("loading");
        const res = await getQuizQuestions(5); // Default limit 5 as per request
        if (res.success) {
            setQuestions(res.data);
            if (res.data.length > 0) {
                setStatus("active");
            } else {
                setStatus("error"); // No questions active
            }
        } else {
            console.error(res.error);
            setStatus("error");
        }
    };

    const handleAnswer = (option, questionId) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finish
            await handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setStatus("submitting");

        // Format answers for submission
        const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
            questionId: qId,
            selectedOption: opt
        }));

        const submissionData = {
            userEmail, // In real app, get from auth context
            sessionId: sessionIdRef.current,
            answers: formattedAnswers
        };

        const res = await submitQuiz(submissionData);

        if (res.success) {
            setResult(res);
            setStatus("completed");
            if (res.percentage >= 70) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } else {
            console.error(res.error);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">

                {status === "idle" && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-20 h-20 bg-orange-100 text-[#FA5429] rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Knowledge Check</h1>
                        <p className="text-gray-500 max-w-md">
                            Test your understanding with a quick quiz. Answer {questions.length > 0 ? questions.length : "a few"} questions to see how you score.
                        </p>

                        {/* Show email input only if not provided in URL */}
                        {!paramEmail && (
                            <div className="w-full max-w-xs">
                                <input
                                    type="email"
                                    placeholder="Enter your email (optional)"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FA5429] outline-none mb-4"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            onClick={loadQuestions}
                            className="bg-[#FA5429] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e0451e] transition-colors shadow-lg shadow-orange-200"
                        >
                            Start Quiz
                        </button>
                    </div>
                )}

                {status === "loading" && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-[#FA5429] animate-spin" />
                        <p className="text-gray-500">Loading questions...</p>
                    </div>
                )}

                {status === "active" && questions.length > 0 && (
                    <div className="flex-1 flex flex-col">
                        {/* Progress Bar */}
                        <div className="h-2 bg-gray-100 w-full">
                            <motion.div
                                className="h-full bg-[#FA5429]"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                            <span className="text-sm font-semibold text-[#FA5429] tracking-wider uppercase mb-4 block">
                                Question {currentIndex + 1} of {questions.length}
                            </span>

                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                                {questions[currentIndex].question}
                            </h2>

                            <div className="space-y-3">
                                {questions[currentIndex].options.map((option, idx) => {
                                    const isSelected = answers[questions[currentIndex]._id] === option;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option, questions[currentIndex]._id)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                                                ${isSelected
                                                    ? "border-[#FA5429] bg-orange-50 text-[#FA5429]"
                                                    : "border-gray-200 hover:border-orange-200 hover:bg-gray-50 text-gray-700"
                                                }
                                            `}
                                        >
                                            <span className="font-medium">{option}</span>
                                            {isSelected && (
                                                <div className="w-5 h-5 bg-[#FA5429] rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-8 border-t bg-gray-50 flex justify-end">
                            <button
                                onClick={handleNext}
                                disabled={!answers[questions[currentIndex]._id]}
                                className={`px-8 py-3 rounded-xl font-semibold transition-all
                                    ${answers[questions[currentIndex]._id]
                                        ? "bg-[#FA5429] text-white shadow-lg shadow-orange-200 hover:bg-[#e0451e]"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }
                                `}
                            >
                                {currentIndex === questions.length - 1 ? "Submit Quiz" : "Next Question"}
                            </button>
                        </div>
                    </div>
                )}

                {status === "submitting" && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-10 h-10 text-[#FA5429] animate-spin" />
                        <p className="text-gray-500">Submitting your results...</p>
                    </div>
                )}

                {status === "completed" && result && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ring-8 ring-opacity-20
                             ${result.percentage >= 50 ? "bg-green-100 text-green-600 ring-green-500" : "bg-red-100 text-red-600 ring-red-500"}
                        `}>
                            {result.percentage >= 50 ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                {result.percentage >= 70 ? "Excellent Job!" : result.percentage >= 50 ? "Good Effort!" : "Keep Learning!"}
                            </h2>
                            <p className="text-gray-500">
                                You scored <span className="font-bold text-gray-900">{result.score}</span> out of <span className="font-bold text-gray-900">{result.totalQuestions}</span>
                            </p>
                        </div>

                        <div className="w-full max-w-xs bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${result.percentage >= 50 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${result.percentage}%` }}
                            />
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <XCircle className="w-16 h-16 text-red-500" />
                        <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                        <p className="text-gray-500">We couldn't load the quiz. Please try again later.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-[#FA5429] font-medium hover:underline"
                        >
                            Refresh Page
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
