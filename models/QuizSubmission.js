import mongoose from 'mongoose';

const QuizAnswerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    questionText: { type: String }, // Snapshot in case question changes
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
}, { _id: false });

const QuizSubmissionSchema = new mongoose.Schema({
    userEmail: { type: String, index: true },
    userId: { type: String, index: true },
    sessionId: { type: String, required: true }, // To link with map session if needed, or unique quiz session

    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    answers: [QuizAnswerSchema],

    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.QuizSubmission || mongoose.model('QuizSubmission', QuizSubmissionSchema);
