import mongoose from 'mongoose';

const QuizQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} must have at least 2 options']
    },
    correctAnswer: { type: String, required: true }, // The string value of the correct option
    category: { type: String, default: 'General' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

function arrayLimit(val) {
    return val.length >= 2;
}

export default mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', QuizQuestionSchema);
