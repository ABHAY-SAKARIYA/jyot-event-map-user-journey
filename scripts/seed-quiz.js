import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars before importing anything else
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const questions = [
    {
        question: "What is the capital of France?",
        options: ["Berlin", "Madrid", "Paris", "Rome"],
        correctAnswer: "Paris",
        category: "Geography"
    },
    {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        category: "Science"
    },
    {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctAnswer: "Blue Whale",
        category: "Biology"
    },
    {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
        correctAnswer: "William Shakespeare",
        category: "Literature"
    },
    {
        question: "What is the chemical symbol for Gold?",
        options: ["Ag", "Au", "Fe", "Cu"],
        correctAnswer: "Au",
        category: "Chemistry"
    },
    {
        question: "Which ocean is the largest?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correctAnswer: "Pacific Ocean",
        category: "Geography"
    },
    {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
        correctAnswer: "Leonardo da Vinci",
        category: "Art"
    }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB...");
        // Dynamic import to ensure env vars are loaded
        const QuizQuestion = (await import('../models/QuizQuestion.js')).default;

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env.local");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        // Log safe part of URI to confirm which DB we are hitting
        const uriParts = process.env.MONGODB_URI.split('@');
        console.log("Connected to MongoDB at " + (uriParts.length > 1 ? uriParts[1] : "localhost"));

        // Add new questions
        const result = await QuizQuestion.insertMany(questions);
        console.log(`Successfully added ${result.length} questions.`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seed();
